import { useEffect, useRef, useState, type CSSProperties } from "react";

import { ProductDetailModal } from "../components/ProductDetailModal";
import type { ODAItem, ProposalV3Data } from "../schema";
import {
  OPTION_BACK_TO_TOP_ICON,
  OPTION_CHAIN_PLACEHOLDER,
  OPTION_COMPARE_ICON,
  OPTION_HOME_ICON,
  OPTION_INFO_ICON,
  OPTION_STICKY_CHEVRON,
  OPTION_USER_ICON,
  sv,
} from "../shared";

export function OptionsScreen({
  data,
  selectedOption,
  onSelect,
  onContinue,
  onHome,
}: {
  data: ProposalV3Data;
  selectedOption: number;
  onSelect: (i: number) => void;
  onContinue: () => void;
  onHome: () => void;
}) {
  const compareRef = useRef<HTMLDivElement>(null);
  const selectButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const expandedCompareCardRef = useRef<HTMLDivElement>(null);
  const [hideComparisonHeader, setHideComparisonHeader] = useState(true);
  const [expandedCompareOptionIdx, setExpandedCompareOptionIdx] = useState<
    number | null
  >(null);
  const [compareProductDetailModal, setCompareProductDetailModal] = useState<{
    item: ODAItem;
    sectionName: string;
    measurementLabel: string;
    description: string;
  } | null>(null);

  const scrollToCompare = () =>
    compareRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  useEffect(() => {
    const syncHeaderVisibility = () => {
      const hasVisibleSelectButton = selectButtonRefs.current.some((button) => {
        if (!button) return false;
        const rect = button.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < window.innerHeight;
      });

      setHideComparisonHeader(hasVisibleSelectButton);
    };

    syncHeaderVisibility();
    window.addEventListener("scroll", syncHeaderVisibility, { passive: true });
    window.addEventListener("resize", syncHeaderVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", syncHeaderVisibility);
      window.removeEventListener("resize", syncHeaderVisibility);
    };
  }, []);

  const setSelectButtonRef =
    (index: number) => (element: HTMLButtonElement | null) => {
      selectButtonRefs.current[index] = element;
    };

  useEffect(() => {
    if (expandedCompareOptionIdx === null) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (expandedCompareCardRef.current?.contains(target)) return;
      setExpandedCompareOptionIdx(null);
    };

    const handleScroll = () => {
      setExpandedCompareOptionIdx(null);
    };

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [expandedCompareOptionIdx]);

  type OptionSummary = {
    title: string;
    description: string;
    duration: string;
    price: string;
    contractTotal: string;
    monthly: string;
    image: string;
  };

  type CompareLineItem = {
    name: string;
    qty: string;
    unit: string;
    img: string;
    imageStyle?: CSSProperties;
    faded?: boolean;
  };

  type CompareDash = { dash: true };

  const optionSummaries: OptionSummary[] = data.options.map((option) => option.summary);

  const scheduleData: Array<Array<{ label: string; value: string }>> = data.options.map(
    (option) => [
      { label: data.optionsPage.contractTotalLabel, value: option.summary.contractTotal },
      {
        label: data.optionsPage.monthlyPaymentLabel,
        value: option.summary.monthly,
      },
      { label: data.optionsPage.constructionTimeLabel, value: option.summary.duration.replace(` ${data.optionsPage.constructionTimeLabel}`, "") },
    ],
  );

  const normalizeCompareText = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();

  const findCompareSourceItem = (
    optionIdx: number,
    sectionTitle: string,
    compareItem: CompareLineItem,
  ) => {
    const sourceSection = data.options[optionIdx]?.scopeGroups.find(
      (section) => section.name === sectionTitle,
    );
    if (!sourceSection) return null;

    const normalizedCompareName = normalizeCompareText(compareItem.name);
    return (
      sourceSection.items.find((sourceItem) => {
        const detailItem = sourceItem.odaItem;
        if (!detailItem) return false;
        const normalizedSpec = normalizeCompareText(detailItem.spec);
        const normalizedName = normalizeCompareText(detailItem.name);
        return (
          normalizedSpec === normalizedCompareName ||
          normalizedName === normalizedCompareName ||
          normalizedSpec.includes(normalizedCompareName) ||
          normalizedCompareName.includes(normalizedSpec)
        );
      }) ?? null
    );
  };

  const openCompareProductDetail = (
    compareItem: CompareLineItem,
    sectionTitle: string,
    optionIdx: number,
  ) => {
    const sourceLineItem = findCompareSourceItem(
      optionIdx,
      sectionTitle,
      compareItem,
    );
    const fallbackItem: ODAItem = {
      id: `compare-${sectionTitle}-${optionIdx}-${compareItem.name}`,
      name: sectionTitle,
      spec: compareItem.name,
      price: 0,
      previewImage: compareItem.img,
    };

    setCompareProductDetailModal({
      item: sourceLineItem?.odaItem ?? fallbackItem,
      sectionName: sectionTitle,
      measurementLabel: `${compareItem.qty} ${compareItem.unit}`,
      description: `Detailed scope reference for ${compareItem.name.toLowerCase()} in ${optionNames[optionIdx].toLowerCase()}.`,
    });
  };

  const compareSectionNames = Array.from(
    new Set(data.options.flatMap((option) => option.scopeGroups.map((group) => group.name))),
  );
  const compareSections: Array<{
    title: string;
    columns: (CompareLineItem | CompareDash)[][];
  }> = compareSectionNames.map((title) => ({
    title,
    columns: data.options.map((option) => {
      const group = option.scopeGroups.find((scopeGroup) => scopeGroup.name === title);
      if (!group || group.items.length === 0) {
        return [{ dash: true as const }];
      }
      return group.items.map((item) => {
        const resolvedImage = item.thumbnailSrc ?? OPTION_CHAIN_PLACEHOLDER;
        const isPlaceholderImage = resolvedImage === OPTION_CHAIN_PLACEHOLDER;
        return {
          name: item.name,
          qty: item.qty,
          unit: item.unit,
          img: resolvedImage,
          faded: isPlaceholderImage,
        };
      });
    }),
  }));

  const optionNames = optionSummaries.map((summary) => summary.title);

  const OptionCard = ({
    optIdx,
    selectButtonRef,
  }: {
    optIdx: number;
    selectButtonRef?: (element: HTMLButtonElement | null) => void;
  }) => {
    const opt = optionSummaries[optIdx];
    return (
      <div
        className="flex flex-col items-center"
        style={{
          flex: "1 0 0",
          minWidth: 0,
          minHeight: 0,
          backgroundColor: "#EDEDED",
          gap: sv(24),
          paddingBottom: sv(48),
          boxShadow: "0px 4px 16px rgba(0,0,0,0.12), 0px 1px 4px rgba(0,0,0,0.08)",
        }}
      >
        <div
          className="relative w-full shrink-0"
          style={{ aspectRatio: "800/471" }}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img
              src={opt.image}
              alt=""
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        </div>
        <div
          className="flex flex-col items-start w-full"
          style={{ padding: `0 ${sv(28)}`, gap: sv(4) }}
        >
          <p
            style={{
              fontSize: sv(18),
              fontWeight: 600,
              color: "#262626",
              width: "100%",
              lineHeight: "normal",
            }}
          >
            {opt.title}
          </p>
        </div>
        <div
          className="flex flex-col items-start w-full"
          style={{ padding: `0 ${sv(28)}`, gap: sv(28) }}
        >
          <div
            className="flex flex-col items-start w-full"
            style={{ gap: sv(4) }}
          >
            <p
              style={{
                fontSize: sv(16),
                color: "#262626",
                width: "100%",
                letterSpacing: sv(-0.16),
                lineHeight: "normal",
              }}
            >
              {opt.description}
            </p>
            <p
              className="truncate"
              style={{
                fontSize: sv(16),
                color: "#262626",
                width: "100%",
                letterSpacing: sv(-0.16),
                lineHeight: "normal",
              }}
            >
              {opt.duration}
            </p>
            <p
              style={{
                fontSize: sv(22),
                fontWeight: 600,
                color: "#262626",
                width: "100%",
                letterSpacing: sv(-0.22),
                lineHeight: "normal",
              }}
            >
              {opt.price}
            </p>
          </div>
          <div className="flex items-center justify-end w-full">
            <button
              ref={selectButtonRef}
              onClick={() => {
                onSelect(optIdx);
                onContinue();
              }}
              className="flex items-center justify-center hover:opacity-90 transition-opacity"
              style={{
                flex: "1 0 0",
                height: sv(40),
                padding: `${sv(6)} ${sv(16)}`,
                backgroundColor: "#d41a32",
                color: "white",
                fontSize: sv(14),
                fontWeight: 600,
                lineHeight: sv(18),
                borderRadius: sv(4),
              }}
            >
              {data.optionsPage.selectButtonLabel}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const LineItem = ({
    item,
    sectionTitle,
    optionIdx,
  }: {
    item: CompareLineItem | CompareDash;
    sectionTitle: string;
    optionIdx: number;
  }) => {
    if ("dash" in item) {
      return (
        <div
          className="flex items-start w-full"
          style={{
            borderTop: "0.5px solid rgba(0,0,0,0.1)",
            paddingTop: sv(12),
            paddingBottom: sv(12),
            backgroundColor: "white",
          }}
        >
          <div
            className="flex flex-1 items-center min-w-0"
            style={{ paddingRight: sv(4) }}
          >
            <p
              style={{
                flex: "1 0 0",
                fontSize: sv(14),
                color: "#262626",
                lineHeight: "normal",
                minWidth: 0,
              }}
            >
              -
            </p>
          </div>
        </div>
      );
    }
    return (
      <button
        type="button"
        onClick={() => openCompareProductDetail(item, sectionTitle, optionIdx)}
        className="flex items-start w-full text-left"
        style={{
          border: "none",
          borderTop: "0.5px solid rgba(0,0,0,0.1)",
          paddingTop: sv(12),
          paddingBottom: sv(12),
          gap: sv(12),
          backgroundColor: "white",
          cursor: "pointer",
          overflow: "hidden",
        }}
      >
        <div
          className="flex-shrink-0 flex flex-col items-start"
          style={{
            width: sv(48),
            height: sv(48),
            padding: sv(2),
            borderRadius: sv(4),
          }}
        >
          <div
            className="relative overflow-hidden"
            style={{ width: "100%", height: "100%", borderRadius: sv(2) }}
          >
            <img
              src={item.img}
              alt=""
              className="absolute pointer-events-none"
              style={
                item.imageStyle ?? {
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: item.faded ? 0.15 : 1,
                }
              }
            />
          </div>
        </div>
        <div
          className="flex flex-1 items-center min-w-0"
          style={{ gap: sv(12), paddingRight: sv(4) }}
        >
          <p
            style={{
              flex: "1 1 auto",
              fontSize: sv(14),
              color: "#262626",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              lineHeight: "normal",
              minWidth: 0,
            }}
          >
            {item.name}
          </p>
          <div
            className="flex items-center flex-shrink-0"
            style={{ width: sv(116), justifyContent: "flex-end" }}
          >
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{ width: sv(24), height: sv(24) }}
            >
              <img
                src={OPTION_INFO_ICON}
                alt=""
                className="pointer-events-none"
                style={{ width: sv(16.333), height: sv(16.333) }}
              />
            </div>
            <div
              className="flex items-center flex-shrink-0"
              style={{
                width: sv(97),
                gap: sv(8),
                fontSize: sv(14),
                fontWeight: 300,
                color: "#262626",
                lineHeight: "normal",
              }}
            >
              <p className="flex-1 text-right min-w-0">{item.qty}</p>
              <p className="flex-shrink-0" style={{ width: sv(32) }}>
                {item.unit}
              </p>
            </div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <>
      <style>{`
      @keyframes bounceUpDown {
        0%, 100% { transform: translateY(-4px); }
        50% { transform: translateY(12px); }
      }
    `}</style>
      <div
        className="bg-white"
        style={{
          fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {/* Fixed sticky comparison header */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 20,
            backgroundColor: "white",
            borderBottom: "0.5px solid rgba(0,0,0,0.2)",
            boxShadow: "0px 4px 3px 0px rgba(123,123,123,0.1)",
            display: hideComparisonHeader ? "none" : undefined,
          }}
        >
          <div
            className="relative flex items-center"
            style={{
              width: sv(1440),
              margin: "0 auto",
              gap: sv(24),
              padding: `0 ${sv(80)}`,
            }}
          >
            {optionNames.map((name, i) => (
              <button
                key={i}
                className="flex items-center"
                style={{
                  flex: "1 0 0",
                  height: sv(48),
                  padding: `0 ${sv(8)}`,
                  gap: sv(4),
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                }}
                onClick={() =>
                  setExpandedCompareOptionIdx((prev) => (prev === i ? null : i))
                }
              >
                <p
                  style={{
                    fontSize: sv(14),
                    fontWeight: 600,
                    color: "#262626",
                    lineHeight: "normal",
                    whiteSpace: "nowrap",
                  }}
                >
                  {name}
                </p>
                <div
                  className="flex items-center justify-center"
                  style={{ width: sv(16), height: sv(16) }}
                >
                  <div
                    style={{
                      width: sv(16),
                      height: sv(16),
                      transform: "rotate(90deg)",
                    }}
                  >
                    <img
                      src={OPTION_STICKY_CHEVRON}
                      alt=""
                      style={{ width: "100%", height: "100%" }}
                    />
                  </div>
                </div>
              </button>
            ))}
            {expandedCompareOptionIdx !== null && !hideComparisonHeader && (
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  transform: "translateX(-50%)",
                  top: "100%",
                  width: sv(1280),
                  zIndex: 21,
                  pointerEvents: "none",
                }}
              >
                <div className="flex" style={{ gap: sv(32) }}>
                  {optionSummaries.map((_, i) => (
                    <div key={i} style={{ flex: "1 0 0", minWidth: 0 }}>
                      {i === expandedCompareOptionIdx ? (
                        <div
                          ref={expandedCompareCardRef}
                          style={{
                            pointerEvents: "auto",
                            boxShadow:
                              "0px 24px 56px rgba(15,23,42,0.18), 0px 8px 20px rgba(15,23,42,0.10)",
                          }}
                        >
                          <OptionCard optIdx={i} />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ width: sv(1440), minHeight: "100vh", margin: "0 auto" }}>
          <div
            className="flex items-center justify-center"
            style={{ paddingTop: sv(28) }}
          >
            <div
              className="flex items-center justify-between"
              style={{ width: sv(991), height: sv(30) }}
            >
              <button
                onClick={onHome}
                className="flex items-center justify-center"
                style={{ width: sv(24), height: sv(24) }}
              >
                <img
                  src={OPTION_HOME_ICON}
                  alt="Home"
                  style={{ width: sv(17.99), height: sv(15.977) }}
                />
              </button>
              {data.project.contractorLogoHeader && (
                <img
                  src={data.project.contractorLogoHeader}
                  alt={data.project.contractorName}
                  style={{ width: sv(109), height: sv(30), objectFit: "cover" }}
                />
              )}
              <button
                className="flex items-center justify-center"
                style={{ width: sv(24), height: sv(24) }}
              >
                <img
                  src={OPTION_USER_ICON}
                  alt="Account"
                  style={{ width: sv(14), height: sv(15.977) }}
                />
              </button>
            </div>
          </div>

          <div
            className="flex flex-col items-center"
            style={{
              width: sv(1440),
              padding: `${sv(41)} ${sv(80)} ${sv(80)}`,
              gap: sv(96),
            }}
          >
            <div
              className="flex flex-col items-center"
              style={{ width: "100%", gap: sv(24) }}
            >
              <div
                className="flex items-start"
                style={{ width: "100%", gap: sv(32) }}
              >
                {optionSummaries.map((_, i) => (
                  <OptionCard
                    key={i}
                    optIdx={i}
                    selectButtonRef={setSelectButtonRef(i)}
                  />
                ))}
              </div>
              <div
                className="flex flex-col items-center"
                style={{ gap: sv(16), paddingBottom: sv(64), paddingTop: sv(16) }}
              >
                <div
                  className="text-center whitespace-nowrap"
                  style={{ fontSize: sv(14), color: "#262626", lineHeight: 0 }}
                >
                  <p style={{ fontWeight: 600, marginBottom: sv(4), lineHeight: "normal" }}>
                    {data.optionsPage.supportTitle}
                  </p>
                  <p style={{ fontWeight: 300, lineHeight: "normal" }}>
                    {data.optionsPage.supportBody}
                  </p>
                </div>
                <button
                  onClick={scrollToCompare}
                  className="flex flex-col items-center justify-center"
                  style={{
                    padding: `${sv(6)} ${sv(4)}`,
                    gap: sv(4),
                    borderRadius: sv(4),
                    background: "transparent",
                    border: "none",
                    color: "#262626",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: sv(20), fontWeight: 300, lineHeight: sv(18), whiteSpace: "nowrap" }}>
                    {data.optionsPage.compareButtonLabel}
                  </span>
                  <div
                    className="overflow-hidden relative"
                    style={{
                      width: sv(24),
                      height: sv(24),
                      animation: "bounceUpDown 1.5s ease-in-out infinite",
                    }}
                  >
                    <img
                      src={OPTION_COMPARE_ICON}
                      alt=""
                      style={{
                        position: "absolute",
                        width: sv(10.131),
                        height: sv(10.131),
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  </div>
                </button>
              </div>
            </div>

            <div ref={compareRef} className="flex flex-col items-center" style={{ width: "100%", gap: sv(64) }}>
              <div className="flex flex-col items-center" style={{ width: "100%", gap: sv(32) }}>
                <p
                  style={{
                    fontSize: sv(28),
                    fontWeight: 600,
                    color: "#262626",
                    textAlign: "center",
                    lineHeight: "normal",
                    width: "100%",
                  }}
                >
                  {data.optionsPage.scheduleTitle}
                </p>
                <div className="flex items-start" style={{ width: "100%", gap: sv(32) }}>
                  {scheduleData.map((column, columnIndex) => (
                    <div
                      key={columnIndex}
                      className="flex flex-col"
                      style={{ flex: "1 0 0", minWidth: 0 }}
                    >
                      {column.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="flex flex-col items-start"
                          style={{
                            borderTop: "0.5px solid rgba(0,0,0,0.1)",
                            padding: `${sv(16)} 0`,
                            width: "100%",
                            textAlign: "center",
                          }}
                        >
                          <p
                            style={{
                              width: "100%",
                              fontSize: sv(14),
                              color: "#737373",
                              letterSpacing: sv(-0.14),
                              lineHeight: "normal",
                            }}
                          >
                            {item.label}
                          </p>
                          <p
                            style={{
                              width: "100%",
                              fontSize: sv(24),
                              fontWeight: 600,
                              color: "#262626",
                              lineHeight: "normal",
                            }}
                          >
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {compareSections.map((section) => (
                <div
                  key={section.title}
                  className="flex flex-col items-center"
                  style={{ width: "100%", gap: sv(32) }}
                >
                  <p
                    style={{
                      fontSize: sv(28),
                      fontWeight: 600,
                      color: "#262626",
                      textAlign: "center",
                      lineHeight: "normal",
                      width: "100%",
                    }}
                  >
                    {section.title}
                  </p>
                  <div
                    className="flex items-start"
                    style={{ width: "100%", gap: sv(32) }}
                  >
                    {section.columns.map((items, columnIndex) => (
                      <div
                        key={columnIndex}
                        className="flex flex-col items-start"
                        style={{ flex: "1 0 0", minWidth: 0 }}
                      >
                        {items.map((item, itemIndex) => (
                          <LineItem
                            key={itemIndex}
                            item={item}
                            sectionTitle={section.title}
                            optionIdx={columnIndex}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div
              className="flex flex-col items-start"
              style={{ width: "100%", gap: sv(40) }}
            >
              <div
                className="flex flex-col items-center"
                style={{ width: "100%", gap: sv(2) }}
              >
                <p
                  style={{
                    width: "100%",
                    fontSize: sv(36),
                    fontWeight: 600,
                    color: "#262626",
                    textAlign: "center",
                    lineHeight: "normal",
                  }}
                >
                  {data.optionsPage.decisionTitle}
                </p>
                <button
                  onClick={scrollToTop}
                  className="flex items-center justify-center"
                  style={{
                    width: sv(276),
                    height: sv(40),
                    padding: `${sv(6)} ${sv(12)}`,
                    gap: sv(4),
                    borderRadius: sv(4),
                    border: "none",
                    backgroundColor: "#ffffff",
                    color: "rgba(0,0,0,0.85)",
                  }}
                >
                  <div
                    className="flex items-center justify-end"
                    style={{ width: sv(20) }}
                  >
                    <div
                      className="relative"
                      style={{ width: sv(24), height: sv(24) }}
                    >
                      <img
                        src={OPTION_BACK_TO_TOP_ICON}
                        alt=""
                        style={{
                          position: "absolute",
                          width: sv(12.008),
                          height: sv(14),
                          left: "50%",
                          top: "50%",
                          transform: "translate(-50%, -50%)",
                        }}
                      />
                    </div>
                  </div>
                  <span style={{ fontSize: sv(14), lineHeight: sv(18) }}>
                    {data.optionsPage.backToTopLabel}
                  </span>
                </button>
              </div>
              <div
                className="flex items-start"
                style={{ width: "100%", gap: sv(32) }}
              >
                {optionSummaries.map((_, i) => (
                  <OptionCard
                    key={i}
                    optIdx={i}
                    selectButtonRef={setSelectButtonRef(i + optionSummaries.length)}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>

        {compareProductDetailModal && (
          <ProductDetailModal
            item={compareProductDetailModal.item}
            sectionName={compareProductDetailModal.sectionName}
            measurementLabel={compareProductDetailModal.measurementLabel}
            description={compareProductDetailModal.description}
            hidePrice={compareProductDetailModal.item.price === 0}
            hideSelectButton
            onSelect={() => undefined}
            onClose={() => setCompareProductDetailModal(null)}
            selectLabel={data.labels.productSelectLabel}
            selectedLabel={data.labels.productSelectedLabel}
          />
        )}
      </div>
    </>
  );
}
