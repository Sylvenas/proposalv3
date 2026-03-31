import { createReactBlockSpec } from "@blocknote/react";

const COMPANY_INFO = {
  name: "Sample Company",
  website: "www.sample.com",
  email: "sample@sample.com",
  phone: "(888) 266-1843",
  address: "Company Street Address",
  cityStateZip: "Company City, MI, 49546",
};

const LogoPlaceholder = () => (
  <div
    style={{
      width: 220,
      height: 140,
      backgroundColor: "#f0f0f0",
      border: "1px solid #e0e0e0",
      borderRadius: 4,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      gap: 8,
    }}
  >
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <path
        d="M8 38 L24 10 L40 38"
        stroke="#c0c0c0"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <line x1="13" y1="30" x2="35" y2="30" stroke="#c0c0c0" strokeWidth="3" strokeLinecap="round" />
    </svg>
    <span style={{ fontSize: 12, color: "#b0b0b0", letterSpacing: 0.5 }}>
      Company Logo
    </span>
  </div>
);

export const createCompanyInfo = createReactBlockSpec(
  {
    type: "companyInfo",
    propSchema: {},
    content: "none",
  },
  {
    render: () => (
      <div className="company-info-block" contentEditable={false} style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 0",
              width: "100%",
              gap: 24,
            }}
          >
            <LogoPlaceholder />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 4,
                flex: 1,
              }}
            >
              <div data-company-field="name" style={{ fontSize: 20, fontWeight: 500, color: "#2d2d2d", marginBottom: 2 }}>
                {COMPANY_INFO.name}
              </div>
              <a
                data-company-field="website"
                href={`https://${COMPANY_INFO.website}`}
                style={{ fontSize: 15, color: "#1a0dab", textDecoration: "underline" }}
                onClick={(e) => e.preventDefault()}
              >
                {COMPANY_INFO.website}
              </a>
              <a
                data-company-field="email"
                href={`mailto:${COMPANY_INFO.email}`}
                style={{ fontSize: 15, color: "#1a0dab", textDecoration: "underline" }}
                onClick={(e) => e.preventDefault()}
              >
                {COMPANY_INFO.email}
              </a>
              <a
                data-company-field="phone"
                href={`tel:${COMPANY_INFO.phone}`}
                style={{ fontSize: 15, color: "#1a0dab", textDecoration: "underline" }}
                onClick={(e) => e.preventDefault()}
              >
                {COMPANY_INFO.phone}
              </a>
              <div data-company-field="address" style={{ fontSize: 15, color: "#2d2d2d" }}>{COMPANY_INFO.address}</div>
              <div data-company-field="cityStateZip" style={{ fontSize: 15, color: "#2d2d2d" }}>{COMPANY_INFO.cityStateZip}</div>
            </div>
          </div>
        </div>
    ),
  },
);
