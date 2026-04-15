"use client";

import Image from "next/image";

import { isPlaceholderProductImage, type SummaryLineItem } from "@/views/proposal-fence/shared";

export function MobileSummaryGroup({
  name,
  items,
  onInfoClick,
}: {
  name: string;
  items: SummaryLineItem[];
  onInfoClick?: (item: SummaryLineItem) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {/* Group header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          height: 44,
        }}
      >
        <span
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#262626",
          }}
        >
          {name}
        </span>
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 4,
            backgroundColor: "#f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 300, color: "#262626" }}>
            {items.length}
          </span>
        </div>
      </div>

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {items.map((item, i) => (
          <button
            key={i}
            type="button"
            onClick={() => item.odaItem && onInfoClick?.(item)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              paddingTop: 12,
              paddingBottom: 12,
              borderTop: "0.5px solid rgba(0,0,0,0.1)",
              backgroundColor: "transparent",
              border: "none",
              borderTopColor: "rgba(0,0,0,0.1)",
              borderTopStyle: "solid",
              borderTopWidth: "0.5px",
              cursor: item.odaItem ? "pointer" : "default",
              textAlign: "left",
              width: "100%",
            }}
          >
            {/* Thumbnail */}
            <div
              style={{
                width: 44,
                height: 44,
                flexShrink: 0,
                borderRadius: 4,
                padding: 2,
                overflow: "hidden",
                position: "relative",
              }}
            >
              {item.thumbnailSrc ? (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 2,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <Image
                    src={item.thumbnailSrc}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="40px"
                    style={{
                      opacity: isPlaceholderProductImage(item.thumbnailSrc) ? 0.1 : 1,
                    }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#f0f0f0",
                    borderRadius: 2,
                  }}
                />
              )}
            </div>

            {/* Name */}
            <span
              style={{
                flex: 1,
                fontSize: 13,
                color: "#262626",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                minWidth: 0,
              }}
            >
              {item.name}
            </span>

            {/* Qty + unit */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 13, color: "#737373", fontWeight: 300 }}>
                {item.qty}
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: "#737373",
                  fontWeight: 300,
                  width: 24,
                }}
              >
                {item.unit}
              </span>
            </div>

            {/* Info chevron */}
            {item.odaItem && (
              <svg viewBox="0 0 16 16" fill="none" style={{ width: 16, height: 16, flexShrink: 0 }}>
                <path
                  d="M6 4l4 4-4 4"
                  stroke="#262626"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
