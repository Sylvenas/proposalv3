import type { ProductGroup } from '../data/mockProposal';

interface ProductListProps {
  productGroups: ProductGroup[];
}

function fmt(n?: number) {
  if (typeof n !== 'number') return null;
  return n.toLocaleString('en-US');
}

export function ProductList({ productGroups }: ProductListProps) {
  if (!productGroups.length) return null;

  return (
    <section>
      <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#9b8b7f' }}>
        Product List
      </p>

      <div className="flex flex-col gap-4">
        {productGroups.map((group, groupIndex) => (
          <div
            key={`${group.categoryName}-${groupIndex}`}
            className="rounded-[28px] overflow-hidden border"
            style={{
              borderColor: 'rgba(255,255,255,0.82)',
              boxShadow: 'var(--arc-shadow-float)',
              background:
                'radial-gradient(circle at top right, rgba(227,87,28,0.08), transparent 28%), linear-gradient(180deg,#ffffff,#fffbf7)',
            }}
          >
            <div
              className="px-5 py-4 border-b"
              style={{ borderColor: '#f1e5db', background: 'rgba(255,255,255,0.72)' }}
            >
              <p className="text-[15px] font-semibold mb-0 tracking-tight" style={{ color: 'var(--arc-ink)' }}>{group.categoryName}</p>
            </div>

            <div className="px-4 py-3">
              {group.products.map((product, productIndex) => (
                <div
                  key={`${group.categoryName}-${product.name}-${productIndex}`}
                  className="py-3.5 px-1 flex gap-3"
                  style={{
                    borderBottom:
                      productIndex === group.products.length - 1 ? 'none' : '1px solid #f3e8df',
                  }}
                >
                  <div
                    className="shrink-0 rounded-[20px] overflow-hidden border"
                    style={{
                      width: 82,
                      height: 82,
                      borderColor: '#eadfd4',
                      background: '#fff8f3',
                      boxShadow: '0 8px 18px rgba(15,23,42,0.06)',
                    }}
                  >
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg" style={{ color: '#ccb8a8' }}>
                        □
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[15px] font-semibold mb-2 leading-snug tracking-tight" style={{ color: 'var(--arc-ink)' }}>
                          {product.name}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {product.quantity ? (
                            <span
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold"
                              style={{ color: 'var(--arc-muted)', background: '#f8f1ea', border: '1px solid #efe2d7' }}
                            >
                              Qty {product.quantity}
                            </span>
                          ) : null}
                          {typeof product.price === 'number' ? (
                            <span
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold"
                              style={{ color: 'var(--arc-orange-deep)', background: 'var(--arc-orange-soft)', border: '1px solid #f4c9ad' }}
                            >
                              ${fmt(product.price)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {product.description ? (
                      <p className="text-[13px] leading-6 mb-0 mt-2" style={{ color: 'var(--arc-muted)' }}>
                        {product.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
