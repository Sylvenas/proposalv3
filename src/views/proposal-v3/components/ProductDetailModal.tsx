import { useState } from "react";
import Image from "next/image";

import type { ODAItem } from "../schema";
import {
  formatPrice,
  getItemPrice,
  isPlaceholderProductImage,
  PRODUCT_DETAIL_EMPTY_LOGO,
  sv,
} from "../shared";

export function ProductDetailModal({
  item,
  sectionName,
  measurementLabel,
  description,
  onSelect,
  onClose,
  hidePrice = false,
  hideSelectButton = false,
  selectLabel = "Select Product",
  selectedLabel = "Product Selected",
}: {
  item: ODAItem;
  sectionName: string;
  measurementLabel?: string;
  description?: string;
  onSelect: (swatchIdx: number) => void;
  onClose: () => void;
  hidePrice?: boolean;
  hideSelectButton?: boolean;
  selectLabel?: string;
  selectedLabel?: string;
}) {
  const swatches = item.swatches ?? item.addonSwatches ?? [];
  const initialSwatch = item.selectedSwatch ?? item.selectedAddonSwatch ?? 0;
  const [activeSwatchIdx, setActiveSwatchIdx] = useState(initialSwatch);
  const [activeThumb, setActiveThumb] = useState(0);
  const displayMeasurementLabel = measurementLabel ?? "";
  const displayDescription = description ?? "";

  // Left gallery images: use per-swatch photos if available, else fall back to item's productImages
  const getImagesForSwatch = (idx: number): string[] => {
    if (item.swatchProductImages?.[idx]?.length)
      return item.swatchProductImages[idx];
    if (item.productImages?.length) return item.productImages;
    if (item.previewImage) return [item.previewImage];
    return [];
  };
  const currentImages = getImagesForSwatch(activeSwatchIdx);
  const mainImage = currentImages[activeThumb] ?? currentImages[0] ?? null;
  const hasOnlyPlaceholderImages =
    currentImages.length > 0 &&
    currentImages.every((src) => isPlaceholderProductImage(src));
  // Only dim placeholder assets; real product photos should render normally.
  const imgOpacity = hasOnlyPlaceholderImages ? 0.1 : 1;

  // Price for the currently displayed swatch variant
  const swatchPrices = item.swatchPrices ?? item.addonSwatchPrices;
  const displayPrice = swatchPrices?.[activeSwatchIdx] ?? getItemPrice(item);

  // Button state: is the currently shown swatch the one already saved as selected?
  const isCurrentlySelected = activeSwatchIdx === initialSwatch;

  const handleSwatchClick = (idx: number) => {
    setActiveSwatchIdx(idx);
    setActiveThumb(0); // reset to first photo of the new variant
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex flex-col justify-end"
      style={{
        backdropFilter: "blur(10px)",
        backgroundColor: "rgba(0,0,0,0.6)",
        paddingTop: sv(113),
      }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full flex flex-col"
        style={{
          height: sv(767),
          borderRadius: `${sv(16)} ${sv(16)} 0 0`,
          boxShadow:
            "0px 2px 4px rgba(0,0,0,0.12), 0px 4px 24px rgba(0,0,0,0.20)",
          gap: sv(16),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header row: close button pinned right — padding 16px top, 16px horizontal */}
        <div
          className="flex justify-end flex-shrink-0"
          style={{ padding: `${sv(16)} ${sv(16)} 0` }}
        >
          <button
            onClick={onClose}
            className="flex items-center justify-center bg-[#F0F0F0] hover:bg-[#e0e0e0] transition-colors"
            style={{ width: sv(24), height: sv(24), borderRadius: sv(4) }}
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              style={{ width: sv(16), height: sv(16) }}
            >
              <path
                d="M3 3l10 10M13 3L3 13"
                stroke="#262626"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Body: flex row, gap 40px, padding 0 64px */}
        <div
          className="flex flex-1 min-h-0"
          style={{ gap: sv(40), padding: `0 ${sv(64)} ${sv(24)}` }}
        >
          {/* Left column: 840px wide, flex col, justify-between */}
          <div
            className="flex flex-col justify-between flex-shrink-0"
            style={{ width: sv(840), paddingBottom: sv(24) }}
          >
            {hasOnlyPlaceholderImages ? (
              <div
                className="relative w-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                style={{
                  height: sv(577),
                  borderRadius: sv(8),
                  backgroundColor: "#d9d9d9",
                }}
              >
                <div
                  className="relative flex-shrink-0"
                  style={{ width: sv(175), height: sv(175) }}
                >
                  <Image
                    src={PRODUCT_DETAIL_EMPTY_LOGO}
                    alt=""
                    fill
                    sizes="175px"
                    className="object-contain"
                    style={{ opacity: 0.95, mixBlendMode: "screen" }}
                  />
                </div>
              </div>
            ) : (
              /* Hero image: aspect 732:510, border-radius 8px */
              <div
                className="relative w-full overflow-hidden bg-[#f0f0f0]"
                style={{ aspectRatio: "732/510", borderRadius: sv(8) }}
              >
                {mainImage && (
                  <Image
                    src={mainImage}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="840px"
                    style={{ opacity: imgOpacity }}
                  />
                )}
              </div>
            )}

            {/* Thumbnail strip: 3 photos of the current product — gap 8px, 86×64 each */}
            {!hasOnlyPlaceholderImages && currentImages.length > 0 && (
              <div className="flex" style={{ gap: sv(8) }}>
                {currentImages.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveThumb(i)}
                    className="flex-shrink-0"
                    style={{
                      width: sv(86),
                      height: sv(64),
                      borderRadius: sv(4),
                      padding: sv(2),
                      border:
                        i === activeThumb
                          ? "1.5px solid #000000"
                          : "1.5px solid transparent",
                    }}
                  >
                    <div
                      className="relative w-full h-full overflow-hidden"
                      style={{ borderRadius: sv(2) }}
                    >
                      <Image
                        src={src}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="86px"
                        style={{ opacity: imgOpacity }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right column — matches Figma 330:3285: flex-[1_0_0] h-full items-start gap-24px */}
          <div
            className="flex flex-col items-start overflow-y-auto"
            style={{
              flex: "1 0 0",
              height: "100%",
              gap: sv(24),
              fontFamily: "'Segoe UI', sans-serif",
              minWidth: 0,
            }}
          >
            {/* Top info block: shrink-0, gap 32px, items-start, w-full — Figma 330:3589 */}
            <div
              className="flex flex-col items-start w-full flex-shrink-0"
              style={{ gap: sv(32) }}
            >
              {/* Header block: gap 12px, items-start, shrink-0 — Figma 330:3577 */}
              <div
                className="flex flex-col items-start w-full flex-shrink-0"
                style={{ gap: sv(12) }}
              >
                {/* Labels: gap 4px, leading-normal, not-italic — Figma 330:3613 */}
                <div
                  className="flex flex-col items-start w-full"
                  style={{
                    gap: sv(4),
                    lineHeight: "normal",
                    fontStyle: "normal",
                  }}
                >
                  <p
                    style={{
                      fontSize: sv(16),
                      fontWeight: 600,
                      color: "#262626",
                      width: "100%",
                    }}
                  >
                    {sectionName}
                  </p>
                  {displayMeasurementLabel && (
                    <p
                      style={{
                        fontSize: sv(16),
                        fontWeight: 400,
                        color: "#737373",
                        letterSpacing: "-0.64px",
                        width: "100%",
                      }}
                    >
                      {displayMeasurementLabel}
                    </p>
                  )}
                </div>

                {/* Alternative product swatches — gap 10px, items-center, shrink-0 — Figma 330:3605 */}
                {!hasOnlyPlaceholderImages && swatches.length > 0 && (
                  <div
                    className="flex items-center flex-shrink-0"
                    style={{ gap: sv(10) }}
                  >
                    {swatches.map((src, i) => (
                      <button
                        key={i}
                        onClick={() => handleSwatchClick(i)}
                        className="flex-shrink-0"
                        style={{
                          width: sv(64),
                          height: sv(64),
                          borderRadius: sv(4),
                          border:
                            i === activeSwatchIdx
                              ? "1.5px solid #000000"
                              : "1.5px solid transparent",
                          padding: sv(2),
                          outline: "none",
                        }}
                      >
                        <div
                          className="relative w-full h-full overflow-hidden"
                          style={{ borderRadius: sv(2) }}
                        >
                          <Image
                            src={src}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product title + description: gap 16px, items-start, shrink-0 — Figma 330:3614 */}
              <div
                className="flex flex-col items-start w-full flex-shrink-0"
                style={{
                  gap: sv(16),
                  lineHeight: "normal",
                  fontStyle: "normal",
                }}
              >
                <p
                  style={{
                    fontSize: sv(20),
                    fontWeight: 600,
                    color: "#262626",
                    letterSpacing: "-0.8px",
                    width: "100%",
                  }}
                >
                  {item.name}
                </p>
                {(displayDescription || item.spec) && (
                  <p
                    style={{
                      fontSize: sv(12),
                      fontWeight: 300,
                      color: "#262626",
                      width: "100%",
                    }}
                  >
                    {displayDescription || item.spec}
                  </p>
                )}
              </div>

              {/* Price — updates per swatch — Figma 330:3592 */}
              {!hidePrice && (
                <div className="flex flex-col items-start w-full flex-shrink-0">
                  <p
                    style={{
                      fontSize: sv(24),
                      fontWeight: 300,
                      color: "#262626",
                      lineHeight: "normal",
                      fontStyle: "normal",
                      width: "100%",
                    }}
                  >
                    {formatPrice(displayPrice)}
                  </p>
                </div>
              )}
            </div>

            {/* CTA button — Figma 330:3583: shrink-0, auto-width (parent has items-start) */}
            {/* selected → gray bg #737373 text #333; unselected → dark bg #262626 text #fff */}
            {!hideSelectButton && !hasOnlyPlaceholderImages && (
              <button
                className="flex items-center justify-center flex-shrink-0 transition-colors"
                style={{
                  height: sv(44),
                  padding: `${sv(6)} ${sv(16)}`,
                  borderRadius: sv(4),
                  backgroundColor: isCurrentlySelected ? "#737373" : "#262626",
                  color: isCurrentlySelected ? "#333333" : "#ffffff",
                  fontFamily: "Roboto, sans-serif",
                  fontWeight: 600,
                  fontSize: sv(14),
                  lineHeight: "18px",
                  whiteSpace: "nowrap",
                  cursor: isCurrentlySelected ? "default" : "pointer",
                }}
                onClick={() => {
                  if (!isCurrentlySelected) onSelect(activeSwatchIdx);
                }}
              >
                {isCurrentlySelected ? selectedLabel : selectLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
