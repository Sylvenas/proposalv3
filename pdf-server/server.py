import os
import re
import tempfile
from datetime import datetime
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from weasyprint import HTML
from bs4 import BeautifulSoup

app = Flask(__name__)
CORS(app)

OUTPUT_DIR = os.path.expanduser("~/Desktop")
DEBUG_DIR = os.path.join(OUTPUT_DIR, "pdf-debug")

PLACEHOLDER_FIELD_MAP = {
    "Customer Name": "customerName",
    "Project Address": "projectAddress",
    "MM/DD/YYYY": "completionDate",
    "$0.00": "totalBudget",
}


def evaluate_condition(actual_value, operator, compare_value):
    a = actual_value.strip().lower()
    c = compare_value.strip().lower()
    if operator == "eq":
        return a == c
    if operator == "neq":
        return a != c
    if operator == "contains":
        return c in a
    if operator == "notContains":
        return c not in a
    print(f"  [warn] Unknown operator '{operator}', defaulting to show")
    return True


def process_conditional_sections(soup, form_data):
    # The frontend stamps data-conditional-wrapper="true" on the exact ancestor
    # that contains both the header and the nested children, so we can remove it
    # in one shot without any DOM-depth guessing.
    wrappers = soup.find_all(attrs={"data-conditional-wrapper": "true"})
    print(f"  Found {len(wrappers)} conditional section wrapper(s)")
    removed = 0
    for wrapper in wrappers:
        field    = wrapper.get("data-condition-field", "")
        operator = wrapper.get("data-condition-operator", "eq")
        compare  = wrapper.get("data-condition-value", "")

        if not compare.strip():
            print(f"  [skip] Empty conditionValue — always shown")
            continue

        actual = str(form_data.get(field, "") or "")
        met = evaluate_condition(actual, operator, compare)
        print(f"  [condition] field='{field}' op='{operator}' compare='{compare}' actual='{actual}' met={met}")

        if not met:
            wrapper.decompose()
            removed += 1
            print(f"  [ok] Removed conditional section")

    print(f"  Conditional sections removed: {removed}")


def build_product_list_html(products, summary=None):
    rows = ""
    for p in products:
        name = p.get("name", "")
        quantity = p.get("quantity", "")
        amount = p.get("amount", "")
        rows += (
            '<div class="product-list-row">'
            f'<div class="product-list-desc"><div class="product-list-name">{name}</div></div>'
            f'<div class="product-list-qty">{quantity}</div>'
            f'<div class="product-list-amt">{amount}</div>'
            "</div>"
        )

    summary_rows = ""
    if summary:
        if summary.get("subtotal"):
            summary_rows += (
                '<div class="product-list-summary-row">'
                f"<span>Subtotal</span><span>{summary['subtotal']}</span>"
                "</div>"
            )
        if summary.get("discount"):
            summary_rows += (
                '<div class="product-list-summary-row">'
                f"<span>Discount</span><span>{summary['discount']}</span>"
                "</div>"
            )
        if summary.get("salesTax"):
            rate = summary.get("salesTaxRate", "")
            rate_prefix = f"({rate}) " if rate else ""
            summary_rows += (
                '<div class="product-list-summary-row">'
                f"<span>Sales Tax</span><span>{rate_prefix}{summary['salesTax']}</span>"
                "</div>"
            )
        if summary.get("total"):
            summary_rows += (
                '<div class="product-list-summary-row product-list-total">'
                f"<span>Total</span><span>{summary['total']}</span>"
                "</div>"
            )
    else:
        total = 0.0
        for p in products:
            cleaned = re.sub(r"[^0-9.\-]", "", p.get("amount", "0"))
            try:
                total += float(cleaned)
            except ValueError:
                pass
        summary_rows = (
            '<div class="product-list-summary-row product-list-total">'
            f"<span>Total</span><span>${total:,.2f}</span>"
            "</div>"
        )

    return (
        '<div class="product-list-block">'
        '<div class="product-list-title">Product List</div>'
        '<div class="product-list-table">'
        '<div class="product-list-header">'
        '<div class="product-list-desc">Description</div>'
        '<div class="product-list-qty">Quantity</div>'
        '<div class="product-list-amt">Amount</div>'
        "</div>"
        f"{rows}"
        f'<div class="product-list-summary">{summary_rows}</div>'
        "</div></div>"
    )


def convert_flex_columns_to_table(soup):
    """Convert bn-block-column-list from flex to CSS table layout for WeasyPrint.

    WeasyPrint miscalculates the height of flex-row containers, leaving a
    large blank gap after them. CSS table layout renders identically and
    does not have this bug. We read each column's data-width attribute to
    preserve the original width ratios as percentage widths.
    """
    for col_list in soup.find_all(class_="bn-block-column-list"):
        columns = col_list.find_all(class_="bn-block-column", recursive=False)
        if not columns:
            continue

        # Read width ratios from data-width (defaults to 1)
        widths = []
        for col in columns:
            try:
                w = float(col.get("data-width", "1"))
            except (ValueError, TypeError):
                w = 1.0
            widths.append(w)
        total = sum(widths)

        # Convert container to table
        col_list["style"] = "display: table; width: 100%;"

        # Convert each column to table-cell with proportional width
        for i, (col, w) in enumerate(zip(columns, widths)):
            pct = (w / total) * 100
            padding_left = "0" if i == 0 else "20px"
            padding_right = "0" if i == len(columns) - 1 else "20px"
            col["style"] = (
                f"display: table-cell; vertical-align: top;"
                f" width: {pct:.1f}%;"
                f" padding: 12px {padding_right} 12px {padding_left};"
            )

    count = len(soup.find_all(class_="bn-block-column-list"))
    if count:
        print(f"  [ok] Converted {count} column-list(s) to table layout")


def replace_placeholders(html, form_data):
    soup = BeautifulSoup(html, "html.parser")

    label_to_value = {}
    for label, field_key in PLACEHOLDER_FIELD_MAP.items():
        value = form_data.get(field_key, "") or "\u2014"
        label_to_value[label] = value

    replaced_count = 0

    for el in soup.find_all(
        attrs={"data-inline-content-type": "placeholderInput"}
    ):
        label = el.get("data-label")

        if label and label in label_to_value:
            value = label_to_value[label]
        else:
            text = el.get_text(strip=True)
            if text in label_to_value:
                label = text
                value = label_to_value[text]
            else:
                print(
                    f"  [skip] no mapping for data-label='{label}', text='{text}'"
                )
                continue

        el.clear()
        new_span = soup.new_tag("span")
        new_span["style"] = "font-weight:500"
        new_span.string = value
        el.append(new_span)
        replaced_count += 1
        print(f"  [ok] '{label}' -> '{value}'")

    print(f"  Total placeholder replacements: {replaced_count}")

    print("[process_conditional_sections] Starting...")
    process_conditional_sections(soup, form_data)

    products = form_data.get("products")
    if products:
        summary = form_data.get("summary")
        product_blocks = soup.find_all(class_="product-list-block")
        print(f"  Found {len(product_blocks)} product-list-block(s)")
        for block in product_blocks:
            new_html = build_product_list_html(products, summary)
            new_tag = BeautifulSoup(new_html, "html.parser")
            block.replace_with(new_tag)
            print(f"  [ok] Replaced product list ({len(products)} items)")

    print("[convert_flex_columns_to_table] Starting...")
    convert_flex_columns_to_table(soup)

    return str(soup)


def save_debug_html(html, label):
    os.makedirs(DEBUG_DIR, exist_ok=True)
    ts = datetime.now().strftime("%H%M%S")
    path = os.path.join(DEBUG_DIR, f"{ts}-{label}.html")
    with open(path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"  Debug HTML saved: {path}")


@app.route("/api/html-preview", methods=["POST"])
def html_preview():
    data = request.get_json()
    if not data or "html" not in data:
        return jsonify({"error": "Missing 'html' field in request body"}), 400

    html_string = data["html"]
    form_data = data.get("formData")

    if form_data:
        html_string = replace_placeholders(html_string, form_data)

    return html_string, 200, {"Content-Type": "text/html; charset=utf-8"}


@app.route("/api/html-to-pdf", methods=["POST"])
def html_to_pdf():
    data = request.get_json()
    if not data or "html" not in data:
        return jsonify({"error": "Missing 'html' field in request body"}), 400

    html_string = data["html"]
    form_data = data.get("formData")
    filename = data.get("filename", "blocknote-export.pdf")

    save_debug_html(html_string, "1-raw")

    if form_data:
        print("[replace_placeholders] Starting replacement...")
        print(f"  formData keys: {list(form_data.keys())}")
        for k, v in form_data.items():
            if k != "products":
                print(f"    {k}: '{v}'")
            else:
                print(f"    products: {len(v)} items")

        html_string = replace_placeholders(html_string, form_data)
        save_debug_html(html_string, "2-replaced")

    try:
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            HTML(string=html_string).write_pdf(tmp.name)
            tmp_path = tmp.name

        save_path = os.path.join(OUTPUT_DIR, filename)
        os.replace(tmp_path, save_path)
        print(f"PDF saved to: {save_path}")

        return send_file(
            save_path,
            mimetype="application/pdf",
            as_attachment=True,
            download_name=filename,
        )
    except Exception as e:
        print(f"ERROR: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/html-to-pdf-playwright", methods=["POST"])
def html_to_pdf_playwright():
    data = request.get_json()
    if not data or "html" not in data:
        return jsonify({"error": "Missing 'html' field in request body"}), 400

    html_string = data["html"]
    form_data = data.get("formData")
    filename = data.get("filename", "blocknote-export-pw.pdf")

    save_debug_html(html_string, "pw-1-raw")

    if form_data:
        print("[Playwright] replace_placeholders starting...")
        html_string = replace_placeholders(html_string, form_data)
        save_debug_html(html_string, "pw-2-replaced")

    try:
        from playwright.sync_api import sync_playwright

        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()
            page.set_content(html_string, wait_until="networkidle")
            pdf_bytes = page.pdf(
                format="A4",
                margin={"top": "20mm", "right": "20mm", "bottom": "20mm", "left": "20mm"},
                print_background=True,
            )
            browser.close()

        save_path = os.path.join(OUTPUT_DIR, filename)
        with open(save_path, "wb") as f:
            f.write(pdf_bytes)
        print(f"[Playwright] PDF saved to: {save_path}")

        return send_file(
            save_path,
            mimetype="application/pdf",
            as_attachment=True,
            download_name=filename,
        )
    except ImportError:
        return jsonify({"error": "playwright is not installed. Run: pip install playwright && playwright install chromium"}), 500
    except Exception as e:
        print(f"[Playwright] ERROR: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(DEBUG_DIR, exist_ok=True)
    print(f"PDF output directory: {OUTPUT_DIR}")
    print(f"Debug HTML directory: {DEBUG_DIR}")
    print("Starting server on http://localhost:5001")
    app.run(host="0.0.0.0", port=5001, debug=True)
