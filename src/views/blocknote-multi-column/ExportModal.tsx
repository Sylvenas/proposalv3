import { useEffect, useState } from "react";

interface ProductItemData {
  name: string;
  quantity: string;
  amount: string;
}

interface ProductSummaryData {
  subtotal: string;
  discount: string;
  salesTaxRate: string;
  salesTax: string;
  total: string;
}

interface ExportFormData {
  customerName: string;
  projectAddress: string;
  completionDate: string;
  totalBudget: string;
  products: ProductItemData[];
  summary: ProductSummaryData;
  companyName?: string;
  companyWebsite?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyAddress?: string;
  companyCityStateZip?: string;
}

const INITIAL_SUMMARY: ProductSummaryData = {
  subtotal: "",
  discount: "",
  salesTaxRate: "",
  salesTax: "",
  total: "",
};

const INITIAL_PRODUCTS: ProductItemData[] = [
  { name: "Condition", quantity: "4", amount: "$320.00" },
  { name: "Product (Line)", quantity: "288.8 ft", amount: "$11,552.00" },
  { name: "Custom Product", quantity: "1", amount: "$40.00" },
];

const INITIAL_FORM: ExportFormData = {
  customerName: "",
  projectAddress: "",
  completionDate: "",
  totalBudget: "",
  products: INITIAL_PRODUCTS,
  summary: INITIAL_SUMMARY,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#555",
  marginBottom: 4,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "6px 10px",
  border: "1px solid #ddd",
  borderRadius: 4,
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
};

const cellInputStyle: React.CSSProperties = {
  ...inputStyle,
  padding: "4px 6px",
  fontSize: 12,
};

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (data: ExportFormData) => void;
  isExporting: boolean;
  initialData?: ExportFormData | null;
  submitLabel?: string;
}

export type { ExportFormData, ProductItemData, ProductSummaryData };

export const ExportModal = ({
  isOpen,
  onClose,
  onExport,
  isExporting,
  initialData,
  submitLabel,
}: ExportModalProps) => {
  const [form, setForm] = useState<ExportFormData>(INITIAL_FORM);

  useEffect(() => {
    if (isOpen && initialData) {
      setForm(initialData);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleFieldChange = (field: keyof Omit<ExportFormData, "products" | "summary">, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSummaryChange = (field: keyof ProductSummaryData, value: string) => {
    setForm((prev) => ({ ...prev, summary: { ...prev.summary, [field]: value } }));
  };

  const handleProductChange = (index: number, field: keyof ProductItemData, value: string) => {
    setForm((prev) => ({
      ...prev,
      products: prev.products.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    }));
  };

  const handleAddProduct = () => {
    setForm((prev) => ({
      ...prev,
      products: [...prev.products, { name: "", quantity: "", amount: "" }],
    }));
  };

  const handleRemoveProduct = (index: number) => {
    setForm((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: 8,
          width: 560,
          maxHeight: "85vh",
          overflow: "auto",
          padding: "24px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700 }}>
          Fill in Export Data
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Customer Name</label>
            <input
              style={inputStyle}
              placeholder="e.g. John Smith"
              value={form.customerName}
              onChange={(e) => handleFieldChange("customerName", e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>Project Address</label>
            <input
              style={inputStyle}
              placeholder="e.g. 123 Main St"
              value={form.projectAddress}
              onChange={(e) => handleFieldChange("projectAddress", e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>Completion Date</label>
            <input
              style={inputStyle}
              type="date"
              value={form.completionDate}
              onChange={(e) => handleFieldChange("completionDate", e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>Total Budget</label>
            <input
              style={inputStyle}
              placeholder="e.g. $50,000.00"
              value={form.totalBudget}
              onChange={(e) => handleFieldChange("totalBudget", e.target.value)}
            />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Product List</label>
            <button
              onClick={handleAddProduct}
              style={{
                padding: "4px 10px",
                fontSize: 12,
                border: "1px solid #ddd",
                borderRadius: 4,
                background: "#fafafa",
                cursor: "pointer",
              }}
            >
              + Add Row
            </button>
          </div>

          <div style={{ border: "1px solid #eee", borderRadius: 4, overflow: "hidden" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 100px 100px 32px",
                gap: 6,
                padding: "6px 8px",
                background: "#f5f5f5",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              <span>Name</span>
              <span>Quantity</span>
              <span>Amount</span>
              <span />
            </div>

            {form.products.map((product, idx) => (
              <div
                key={idx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 100px 100px 32px",
                  gap: 6,
                  padding: "4px 8px",
                  borderTop: "1px solid #eee",
                  alignItems: "center",
                }}
              >
                <input
                  style={cellInputStyle}
                  value={product.name}
                  onChange={(e) => handleProductChange(idx, "name", e.target.value)}
                />
                <input
                  style={cellInputStyle}
                  value={product.quantity}
                  onChange={(e) => handleProductChange(idx, "quantity", e.target.value)}
                />
                <input
                  style={cellInputStyle}
                  value={product.amount}
                  onChange={(e) => handleProductChange(idx, "amount", e.target.value)}
                />
                <button
                  onClick={() => handleRemoveProduct(idx)}
                  style={{
                    border: "none",
                    background: "none",
                    color: "#ccc",
                    cursor: "pointer",
                    fontSize: 16,
                    padding: 0,
                    lineHeight: 1,
                  }}
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ ...labelStyle, marginBottom: 8 }}>Product Summary</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ ...labelStyle, fontSize: 11 }}>Subtotal</label>
              <input style={inputStyle} placeholder="e.g. $11,912.00" value={form.summary.subtotal} onChange={(e) => handleSummaryChange("subtotal", e.target.value)} />
            </div>
            <div>
              <label style={{ ...labelStyle, fontSize: 11 }}>Discount</label>
              <input style={inputStyle} placeholder="e.g. -$200.00" value={form.summary.discount} onChange={(e) => handleSummaryChange("discount", e.target.value)} />
            </div>
            <div>
              <label style={{ ...labelStyle, fontSize: 11 }}>Sales Tax Rate</label>
              <input style={inputStyle} placeholder="e.g. 8.25%" value={form.summary.salesTaxRate} onChange={(e) => handleSummaryChange("salesTaxRate", e.target.value)} />
            </div>
            <div>
              <label style={{ ...labelStyle, fontSize: 11 }}>Sales Tax</label>
              <input style={inputStyle} placeholder="e.g. $966.24" value={form.summary.salesTax} onChange={(e) => handleSummaryChange("salesTax", e.target.value)} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ ...labelStyle, fontSize: 11 }}>Total</label>
              <input style={inputStyle} placeholder="e.g. $12,678.24" value={form.summary.total} onChange={(e) => handleSummaryChange("total", e.target.value)} />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 8, borderTop: "1px solid #eee" }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 20px",
              border: "1px solid #ddd",
              borderRadius: 6,
              fontSize: 14,
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onExport(form)}
            disabled={isExporting}
            style={{
              padding: "8px 20px",
              backgroundColor: isExporting ? "#ccc" : "#228be6",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: isExporting ? "not-allowed" : "pointer",
            }}
          >
            {isExporting ? "Exporting..." : (submitLabel ?? "Export PDF")}
          </button>
        </div>
      </div>
    </div>
  );
};
