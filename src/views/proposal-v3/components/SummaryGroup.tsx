import Image from "next/image";

import { InfoIcon } from "./InfoIcon";
import {
  OPTION_CHAIN_PLACEHOLDER,
  isPlaceholderProductImage,
  type SummaryLineItem,
  sv,
} from "../shared";

const PLACEHOLDER_IMAGE_OPACITY = 0.15;

export function SummaryGroup({
  name,
  items,
  layoutAlt,
  onInfoClick,
  changeLabel = "Change",
  fallbackImage,
}: {
  name: string;
  items: SummaryLineItem[];
  layoutAlt?: boolean;
  onInfoClick?: (item: SummaryLineItem) => void;
  changeLabel?: string;
  fallbackImage?: string;
}) {
  return (
    <div className="flex flex-col w-full">
      {/* Group header: h-[48px], semibold 16px + count badge */}
      <div className="flex items-center" style={{ gap: sv(4), height: sv(48) }}>
        <p
          className="font-semibold text-[#262626]"
          style={{ fontSize: sv(16) }}
        >
          {name}
        </p>
        <div
          className="bg-[#f0f0f0] flex items-center justify-center"
          style={{
            width: sv(20),
            height: sv(20),
            borderRadius: sv(4),
            marginLeft: sv(4),
          }}
        >
          <span
            className="text-[#262626]"
            style={{ fontSize: sv(10), fontWeight: 300 }}
          >
            {items.length}
          </span>
        </div>
      </div>
      {/* Line items */}
      <div className="flex flex-col w-full">
        {items.map((item, i) =>
          layoutAlt && item.showChange !== false ? (
            /* ── Alternative (large image) layout — only for product items with images ── */
            <div
              key={i}
              className="flex items-start w-full"
              style={{
                paddingTop: sv(12),
                paddingBottom: sv(12),
                borderTop: "0.5px solid rgba(0,0,0,0.1)",
              }}
            >
              {/* Image: 300×200, p-[2px], rounded-[4px] outer, rounded-[2px] inner */}
              <button
                type="button"
                className="flex-shrink-0 text-left"
                style={{
                  padding: sv(2),
                  borderRadius: sv(4),
                  cursor: item.odaItem ? "pointer" : "default",
                }}
                onClick={() => item.odaItem && onInfoClick?.(item)}
              >
                <div
                  className="relative overflow-hidden flex-shrink-0"
                  style={{
                    width: sv(300),
                    height: sv(200),
                    borderRadius: sv(2),
                    border: "0.5px solid #d9d9d9",
                  }}
                >
                  {(() => {
                    const resolvedSrc = item.thumbnailSrc ?? fallbackImage ?? OPTION_CHAIN_PLACEHOLDER;
                    const isFallback = !item.thumbnailSrc && !!fallbackImage && resolvedSrc === fallbackImage;
                    return (
                      <Image
                        src={resolvedSrc}
                        alt=""
                        fill
                        className={isFallback ? "object-contain" : "object-cover"}
                        sizes="300px"
                        style={{
                          opacity: isPlaceholderProductImage(resolvedSrc)
                            ? PLACEHOLDER_IMAGE_OPACITY
                            : 1,
                        }}
                      />
                    );
                  })()}
                </div>
              </button>
              {/* Right content */}
              <div
                className="flex flex-1 flex-col min-w-0 self-stretch"
                style={{ gap: sv(24), paddingTop: sv(4), paddingBottom: sv(4) }}
              >
                {/* Top row: text info + actions */}
                <div className="flex items-start justify-end w-full">
                  {/* Text: name, qty, price */}
                  <div
                    className="flex flex-1 flex-col min-w-0"
                    style={{
                      gap: sv(8),
                      paddingLeft: sv(12),
                      paddingRight: sv(12),
                      fontSize: sv(14),
                    }}
                  >
                    <button
                      type="button"
                      className="w-fit max-w-full text-left"
                      style={{ cursor: item.odaItem ? "pointer" : "default" }}
                      onClick={() => item.odaItem && onInfoClick?.(item)}
                    >
                      <p className="text-[#262626] truncate min-w-0">
                        {item.name}
                      </p>
                    </button>
                    <div
                      className="flex items-center flex-shrink-0"
                      style={{
                        gap: sv(8),
                        width: sv(130),
                        fontWeight: 300,
                        color: "#737373",
                      }}
                    >
                      <p className="flex-shrink-0 whitespace-nowrap">
                        {item.qty}
                      </p>
                      <p className="flex-shrink-0" style={{ width: sv(32) }}>
                        {item.unit}
                      </p>
                    </div>
                  </div>
                  {/* Actions: w-[112px] */}
                  <div
                    className="flex items-center justify-between flex-shrink-0"
                    style={{ width: sv(112) }}
                  >
                    <button
                      className="flex items-center justify-center hover:opacity-60 transition-opacity"
                      style={{
                        width: sv(24),
                        height: sv(24),
                        cursor: item.odaItem ? "pointer" : "default",
                      }}
                      onClick={() => item.odaItem && onInfoClick?.(item)}
                    >
                      <InfoIcon />
                    </button>
                    {item.showChange ? (
                      <button
                        type="button"
                        className="flex items-center hover:opacity-60 transition-opacity"
                        style={{
                          gap: sv(8),
                          height: sv(24),
                          cursor: item.odaItem ? "pointer" : "default",
                        }}
                        onClick={() => item.odaItem && onInfoClick?.(item)}
                      >
                        <span
                          className="font-semibold text-[#262626]"
                          style={{ fontSize: sv(14), letterSpacing: "-0.56px" }}
                        >
                          {changeLabel}
                        </span>
                        <svg
                          viewBox="0 0 16 16"
                          fill="none"
                          className="flex-shrink-0"
                          style={{ width: sv(16), height: sv(16) }}
                        >
                          <path
                            d="M6 4l4 4-4 4"
                            stroke="#262626"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    ) : (
                      <div style={{ width: sv(78) }} />
                    )}
                  </div>
                </div>
                {/* Description row */}
                {item.description && (
                  <div className="px-[12px]">
                    <p className="text-[12px] text-[#737373] leading-normal">
                      {item.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ── Compact (small image) layout ── */
            <div
              key={i}
              className="flex items-start w-full"
              style={{
                gap: sv(12),
                paddingTop: sv(12),
                paddingBottom: sv(12),
                borderTop: "0.5px solid rgba(0,0,0,0.1)",
              }}
            >
              {/* Thumbnail: 48x48, rounded-[4px], p-[2px] */}
              <button
                type="button"
                className="flex-shrink-0 text-left"
                style={{
                  width: sv(48),
                  height: sv(48),
                  borderRadius: sv(4),
                  padding: sv(2),
                  cursor: item.odaItem ? "pointer" : "default",
                }}
                onClick={() => item.odaItem && onInfoClick?.(item)}
              >
                <div
                  className="relative w-full h-full overflow-hidden"
                  style={{ borderRadius: sv(2) }}
                >
                  {(() => {
                    const resolvedSrc = item.thumbnailSrc ?? fallbackImage ?? OPTION_CHAIN_PLACEHOLDER;
                    const isFallback = !item.thumbnailSrc && !!fallbackImage && resolvedSrc === fallbackImage;
                    return (
                      <Image
                        src={resolvedSrc}
                        alt=""
                        fill
                        className={isFallback ? "object-contain" : "object-cover"}
                        sizes="44px"
                        style={{
                          opacity: isPlaceholderProductImage(resolvedSrc)
                            ? PLACEHOLDER_IMAGE_OPACITY
                            : 1,
                        }}
                      />
                    );
                  })()}
                </div>
              </button>
              {/* Content */}
              <div className="flex flex-1 items-center min-w-0">
                {/* Name: flex-1 truncate, 14px regular */}
                <button
                  type="button"
                  className="flex-1 min-w-0 text-left"
                  style={{ cursor: item.odaItem ? "pointer" : "default" }}
                  onClick={() => item.odaItem && onInfoClick?.(item)}
                >
                  <p
                    className="flex-1 text-[#262626] truncate min-w-0"
                    style={{ fontSize: sv(14) }}
                  >
                    {item.name}
                  </p>
                </button>
                {/* Qty + unit: w-[130px], gap-[16px], semilight 14px */}
                <div
                  className="flex items-center justify-end flex-shrink-0"
                  style={{ width: sv(130), gap: sv(16), fontWeight: 300 }}
                >
                  <p
                    className="flex-1 text-[#262626] text-right"
                    style={{ fontSize: sv(14) }}
                  >
                    {item.qty}
                  </p>
                  <p
                    className="text-[#262626] flex-shrink-0"
                    style={{ fontSize: sv(14), width: sv(32) }}
                  >
                    {item.unit}
                  </p>
                </div>
                {/* Actions: w-[112px] */}
                <div
                  className="flex items-center justify-between flex-shrink-0"
                  style={{ width: sv(112) }}
                >
                  <button
                    className="flex items-center justify-center hover:opacity-60 transition-opacity"
                    style={{
                      width: sv(24),
                      height: sv(24),
                      cursor: item.odaItem ? "pointer" : "default",
                    }}
                    onClick={() => item.odaItem && onInfoClick?.(item)}
                  >
                    <InfoIcon />
                  </button>
                  {item.showChange !== false ? (
                    <button
                      type="button"
                      className="flex items-center hover:opacity-60 transition-opacity"
                      style={{
                        gap: sv(8),
                        height: sv(24),
                        cursor: item.odaItem ? "pointer" : "default",
                      }}
                      onClick={() => item.odaItem && onInfoClick?.(item)}
                    >
                      <span
                        className="font-semibold text-[#262626]"
                        style={{ fontSize: sv(14), letterSpacing: "-0.56px" }}
                      >
                        Change
                      </span>
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        className="flex-shrink-0"
                        style={{ width: sv(16), height: sv(16) }}
                      >
                        <path
                          d="M6 4l4 4-4 4"
                          stroke="#262626"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  ) : (
                    <div style={{ width: sv(78) }} />
                  )}
                </div>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
