import os
import tempfile
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from weasyprint import HTML

app = Flask(__name__)
CORS(app)

OUTPUT_DIR = os.path.expanduser("~/Desktop")


@app.route("/api/html-to-pdf", methods=["POST"])
def html_to_pdf():
    data = request.get_json()
    if not data or "html" not in data:
        return jsonify({"error": "Missing 'html' field in request body"}), 400

    html_string = data["html"]
    filename = data.get("filename", "blocknote-export.pdf")

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
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"PDF output directory: {OUTPUT_DIR}")
    print("Starting server on http://localhost:5001")
    app.run(host="0.0.0.0", port=5001, debug=True)
