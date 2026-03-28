import { createReactBlockSpec } from "@blocknote/react";

interface ProductItem {
  name: string;
  subtitle?: string;
  quantity?: string;
  amount?: string;
  hasImage?: boolean;
  discount?: { rate: string; value: string; afterDiscount: string };
  subItems?: Array<{ name: string; quantity: string }>;
}

const MOCK_PRODUCTS: ProductItem[] = [
  {
    name: "Condition",
    quantity: "4",
    hasImage: true,
    amount: "$320.00",
  },
  {
    name: "Product (Line)",
    quantity: "288.8 ft",
    amount: "$11,552.00",
  },
  {
    name: "Custom Product",
    subtitle: "Other Item",
    amount: "$40.00",
  },
];

const SUMMARY = {
  subtotal: "$11,912.00",
  discount: "-$200.00",
  salesTaxRate: "8.25%",
  salesTax: "$966.24",
  total: "$12,678.24",
};

const ProductImage = () => (
  <div
    style={{
      width: 24,
      height: 24,
      borderRadius: "50%",
      background:
        "radial-gradient(circle at 35% 35%, #4a7aff, #1a3ab8 60%, #0d1f6b)",
      flexShrink: 0,
    }}
  />
);

const ProductRow = ({ item }: { item: ProductItem }) => (
  <div className="product-list-row">
    <div className="product-list-desc">
      {item.hasImage && <ProductImage />}
      <div>
        <div className="product-list-name">{item.name}</div>
        {item.subtitle && (
          <div className="product-list-subtitle">{item.subtitle}</div>
        )}
      </div>
    </div>
    <div className="product-list-qty">{item.quantity}</div>
    <div className="product-list-amt">
      {item.amount && <span>{item.amount}</span>}
      {item.discount && (
        <>
          <div className="product-list-discount">
            Discount ({item.discount.rate}) {item.discount.value}
          </div>
          <div className="product-list-after-discount">
            After discount: {item.discount.afterDiscount}
          </div>
        </>
      )}
    </div>
  </div>
);

const SubItemRow = ({
  subItem,
}: {
  subItem: { name: string; quantity: string };
}) => (
  <div className="product-list-subrow">
    <div className="product-list-desc" style={{ paddingLeft: 20 }}>
      {subItem.name}
    </div>
    <div className="product-list-qty">{subItem.quantity}</div>
    <div className="product-list-amt" />
  </div>
);

export const createProductList = createReactBlockSpec(
  {
    type: "productList",
    propSchema: {},
    content: "none",
  },
  {
    render: () => {
      return (
        <div className="product-list-block" contentEditable={false}>
          <div className="product-list-title">Product List</div>
          <div className="product-list-table">
            <div className="product-list-header">
              <div className="product-list-desc">Description</div>
              <div className="product-list-qty">Quantity</div>
              <div className="product-list-amt">Amount</div>
            </div>

            {MOCK_PRODUCTS.map((item, idx) => (
              <div key={idx}>
                <ProductRow item={item} />
                {item.subItems?.map((sub, subIdx) => (
                  <SubItemRow key={subIdx} subItem={sub} />
                ))}
              </div>
            ))}

            <div className="product-list-summary">
              <div className="product-list-summary-row">
                <span>Subtotal</span>
                <span>{SUMMARY.subtotal}</span>
              </div>
              <div className="product-list-summary-row">
                <span>Discount</span>
                <span>{SUMMARY.discount}</span>
              </div>
              <div className="product-list-summary-row">
                <span>Sales Tax</span>
                <span>
                  ({SUMMARY.salesTaxRate}) {SUMMARY.salesTax}
                </span>
              </div>
              <div className="product-list-summary-row product-list-total">
                <span>Total</span>
                <span>{SUMMARY.total}</span>
              </div>
            </div>
          </div>
        </div>
      );
    },
  },
);
