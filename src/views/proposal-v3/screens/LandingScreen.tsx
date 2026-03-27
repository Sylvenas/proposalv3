import { useEffect, useRef, useState } from "react";

import type { ProposalV3Data } from "../schema";
import { InspectionDetailModal } from "../components/InspectionDetailModal";
import {
  FENCE_FIT_ICON,
  FENCE_HOME_ICON,
  FENCE_PHONE_ICON,
  FENCE_USER_ICON,
  FENCE_VIDEO_PLAY_ICON,
  FENCE_ZOOM_IN_ICON,
  FENCE_ZOOM_OUT_ICON,
  type InspectionEntry,
  sv,
} from "../shared";

export function LandingScreen({
  data,
  onContinue,
  onHome,
}: {
  data: ProposalV3Data;
  onContinue: () => void;
  onHome: () => void;
}) {
  const HERO_DESIGN_WIDTH = 1440;
  const HERO_DESIGN_HEIGHT = 1024;
  const HERO_MAX_SCALE = 1;
  const scrollRef = useRef<HTMLDivElement>(null);
  const heroActionsRef = useRef<HTMLDivElement>(null);
  const [inspectionModal, setInspectionModal] = useState<{
    entryIndex: number;
    mediaIndex: number;
  } | null>(null);
  const [isInspectionSectionPinned, setIsInspectionSectionPinned] =
    useState(false);
  const [heroScale, setHeroScale] = useState(1);

  const hsv = (px: number) => `${px * heroScale}px`;

  // Track when section 2 has reached the top so the top nav can appear.
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const onScroll = () => {
      const actionsRect = heroActionsRef.current?.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      if (!actionsRect) {
        setIsInspectionSectionPinned(false);
        return;
      }

      setIsInspectionSectionPinned(actionsRect.bottom <= containerRect.top);
    };

    onScroll();
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const updateHeroScale = () => {
      const widthScale = window.innerWidth / HERO_DESIGN_WIDTH;
      const heightScale = window.innerHeight / HERO_DESIGN_HEIGHT;
      setHeroScale(Math.min(widthScale, heightScale, HERO_MAX_SCALE));
    };

    updateHeroScale();
    window.addEventListener("resize", updateHeroScale, { passive: true });
    return () => window.removeEventListener("resize", updateHeroScale);
  }, []);

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToInspection = () => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.clientHeight,
      behavior: "smooth",
    });
  };

  const inspectionItems: InspectionEntry[] = data.landing.inspectionItems;
  const floorPlanMarkers = data.landing.floorPlanMarkers;

  const openInspectionModal = (entryIndex: number, mediaIndex = 0) => {
    setInspectionModal({ entryIndex, mediaIndex });
  };

  const InspectionNavBar = () => (
    <nav
      className="flex justify-between items-center"
      style={{ padding: `${sv(24)} ${sv(217)}` }}
    >
      <button
        onClick={scrollToTop}
        className="flex items-center justify-center text-[#262626]"
        style={{ width: sv(24), height: sv(24) }}
      >
        <img
          src={FENCE_HOME_ICON}
          alt="Home"
          style={{ width: sv(17.99), height: sv(15.98) }}
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
        onClick={onHome}
        className="flex items-center justify-center text-[#737373]"
        style={{ width: sv(24), height: sv(24) }}
      >
        <img
          src={FENCE_USER_ICON}
          alt="Account"
          style={{ width: sv(14), height: sv(15.98) }}
        />
      </button>
    </nav>
  );

  return (
    <div
      ref={scrollRef}
      style={{
        height: "100vh",
        minWidth: "1280px",
        overflowY: "scroll",
        fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* ── Section 1: Hero (100vh) ── */}
      <section
        className="bg-white"
        style={{
          height: "100vh",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#262626",
          }}
        >
          {/* Company Logo */}
          <div
            style={{
              width: hsv(281),
              height: hsv(281),
              flexShrink: 0,
            }}
          >
            {data.project.contractorLogo && (
              <img
                src={data.project.contractorLogo}
                alt={data.project.contractorName}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
          </div>

          {/* Spacer between logo and title block */}
          <div style={{ height: hsv(79), flexShrink: 0 }} />

          {/* Title Block: address + title + prepared for */}
          <div
            className="flex flex-col items-center"
            style={{ flexShrink: 0 }}
          >
            <p
              className="m-0 text-center whitespace-nowrap"
              style={{
                fontSize: hsv(20),
                fontWeight: 300,
                lineHeight: "normal",
              }}
            >
              {data.project.projectAddress}
            </p>
            <h1
              className="m-0 text-center whitespace-nowrap"
              style={{
                fontSize: hsv(48),
                fontWeight: 300,
                lineHeight: "normal",
                letterSpacing: hsv(-0.48),
              }}
            >
              {data.project.displayTitle}
            </h1>
            <p
              className="m-0 text-center whitespace-nowrap"
              style={{
                paddingTop: hsv(8),
                fontSize: hsv(20),
                fontWeight: 300,
                lineHeight: "normal",
              }}
            >
              {`${data.landing.preparedForPrefix} ${data.project.clientName}`}
            </p>
          </div>

          {/* Spacer */}
          <div style={{ height: hsv(96), flexShrink: 0 }} />

          {/* Build Your Dream Fence */}
          <p
            className="m-0 text-center whitespace-nowrap"
            style={{
              fontSize: hsv(20),
              fontWeight: 300,
              lineHeight: "normal",
              flexShrink: 0,
            }}
          >
            {data.landing.heroEyebrow}
          </p>

          {/* Spacer */}
          <div style={{ height: hsv(49), flexShrink: 0 }} />

          {/* Action Buttons */}
          <div
            ref={heroActionsRef}
            className="flex items-center"
            style={{ gap: hsv(8), flexShrink: 0 }}
          >
            <button
              onClick={scrollToInspection}
              className="flex items-center justify-center transition-opacity hover:opacity-85"
              style={{
                width: hsv(168),
                height: hsv(40),
                border: `${hsv(1)} solid #262626`,
                backgroundColor: "#ffffff",
                color: "rgba(0,0,0,0.85)",
                fontSize: hsv(14),
                fontWeight: 400,
                lineHeight: hsv(18),
                cursor: "pointer",
              }}
            >
              {data.landing.primaryButtonLabel}
            </button>
            <button
              onClick={onContinue}
              className="flex items-center justify-center transition-opacity hover:opacity-85"
              style={{
                width: hsv(168),
                height: hsv(40),
                backgroundColor: "#d41a32",
                color: "#ffffff",
                fontSize: hsv(14),
                fontWeight: 600,
                lineHeight: hsv(18),
                cursor: "pointer",
              }}
            >
              {data.landing.secondaryButtonLabel}
            </button>
          </div>

          {/* Spacer */}
          <div style={{ height: hsv(14), flexShrink: 0 }} />

          {/* Valid Until */}
          <p
            className="m-0 text-center whitespace-nowrap"
            style={{
              fontSize: hsv(16),
              fontWeight: 300,
              lineHeight: "normal",
              flexShrink: 0,
            }}
          >
            {data.landing.validUntil}
          </p>
        </div>
      </section>

      {/* ── Section 2: Inspection Details (free-scrolls after snap) ── */}
      <section style={{ backgroundColor: "#ffffff", paddingBottom: sv(64) }}>
        {/* Sticky header: nav + inspection details bar */}
        <div
          className="bg-white"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            borderBottom: isInspectionSectionPinned
              ? `0.5px solid rgba(0,0,0,0.2)`
              : "0.5px solid transparent",
            opacity: isInspectionSectionPinned ? 1 : 0,
            pointerEvents: isInspectionSectionPinned ? "auto" : "none",
            transition: "opacity 0.2s ease, border-color 0.2s ease",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: sv(1440),
              margin: "0 auto",
            }}
          >
            <InspectionNavBar />
          </div>
          <div
            className="flex items-center justify-between"
            style={{
              width: "100%",
              maxWidth: sv(1440),
              margin: "0 auto",
              padding: `${sv(16)} ${sv(99)}`,
            }}
          >
            <div className="flex flex-col" style={{ gap: sv(2) }}>
              <p
                style={{
                  fontSize: sv(20),
                  fontWeight: 600,
                  color: "#262626",
                  lineHeight: "normal",
                }}
              >
                {data.landing.stickyTitle}
              </p>
              <p
                style={{
                  fontSize: sv(14),
                  fontWeight: 400,
                  color: "#262626",
                  lineHeight: "normal",
                }}
              >
                {data.landing.stickyAddress}
              </p>
            </div>
            <div className="flex items-center" style={{ gap: sv(8) }}>
              <button
                className="flex items-center justify-center"
                style={{
                  height: sv(40),
                  padding: `0 ${sv(16)}`,
                  gap: sv(6),
                  border: `${sv(1)} solid #262626`,
                  borderRadius: sv(4),
                  backgroundColor: "white",
                  color: "rgba(0,0,0,0.85)",
                  fontSize: sv(14),
                  lineHeight: "normal",
                }}
              >
                <img
                  src={FENCE_PHONE_ICON}
                  alt=""
                  style={{ width: sv(24), height: sv(22) }}
                />
                <span>{data.landing.stickyPrimaryButtonLabel}</span>
              </button>
              <button
                className="flex items-center justify-center"
                style={{
                  height: sv(40),
                  padding: `0 ${sv(16)}`,
                  backgroundColor: "rgb(212, 26, 50)",
                  color: "white",
                  border: "none",
                  borderRadius: sv(4),
                  fontSize: sv(14),
                  fontWeight: 600,
                  lineHeight: "normal",
                }}
                onClick={onContinue}
              >
                {data.landing.stickySecondaryButtonLabel}
              </button>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div style={{ width: "100%", maxWidth: sv(1440), margin: "0 auto" }}>
          <div
            style={{
              padding: `${sv(32)} ${sv(95)}`,
              display: "flex",
              flexDirection: "column",
              gap: sv(24),
            }}
          >
            <div
              className="bg-white flex flex-col"
              style={{
                borderRadius: sv(12),
                width: sv(1249),
                margin: "0 auto",
                padding: `${sv(16)} ${sv(48)} ${sv(40)}`,
                gap: sv(32),
                boxShadow: "0px 0px 8px 0px rgba(0,0,0,0.2)",
              }}
            >
              <div
                className="flex items-center"
                style={{ paddingTop: sv(16) }}
              >
                <p
                  style={{
                    fontSize: sv(16),
                    fontWeight: 600,
                    color: "#262626",
                    lineHeight: "normal",
                  }}
                >
                  {data.landing.inspectionSectionTitle}
                </p>
              </div>
              <div
                className="flex flex-col justify-between"
                style={{ height: sv(776) }}
              >
                <div
                  className="relative self-center overflow-hidden"
                  style={{
                    width: sv(1109),
                    height: sv(744),
                    borderRadius: sv(4),
                  }}
                >
                  <div
                    className="absolute inset-0 overflow-hidden pointer-events-none"
                    style={{ borderRadius: sv(4) }}
                  >
                    <img
                      src={data.landing.inspectionDrawing}
                      alt={data.landing.inspectionSectionTitle}
                      style={{
                        position: "absolute",
                        width: "197.75%",
                        height: "381.45%",
                        left: "-56.4%",
                        top: "-140.73%",
                        maxWidth: "none",
                      }}
                    />
                  </div>
                  {floorPlanMarkers.map((marker) => (
                    <button
                      key={marker.id}
                      onClick={() => openInspectionModal(marker.id - 1, 0)}
                      className="absolute flex items-center justify-center transition-opacity hover:opacity-85 focus:outline-none"
                      style={{
                        left: marker.x,
                        top: marker.y,
                        transform: "translate(-50%, -50%)",
                        width: sv(44),
                        height: sv(44),
                        borderRadius: sv(2),
                        backgroundColor: "#262626",
                        color: "#ffffff",
                        fontSize: sv(24),
                        fontWeight: 700,
                        lineHeight: "normal",
                        fontFamily: "Arial, sans-serif",
                      }}
                      type="button"
                    >
                      {marker.id}
                    </button>
                  ))}
                  <div
                    className="absolute left-0 right-0 bottom-0 flex items-end"
                    style={{ gap: sv(12), padding: `${sv(24)} ${sv(32)}` }}
                  >
                    {[
                      FENCE_ZOOM_IN_ICON,
                      FENCE_ZOOM_OUT_ICON,
                      FENCE_FIT_ICON,
                    ].map((icon, index) => (
                      <button
                        key={icon}
                        className="flex items-center justify-center focus:outline-none"
                        style={{
                          width: sv(48),
                          height: sv(48),
                          borderRadius: sv(4),
                          backgroundColor: "rgba(0,0,0,0.6)",
                          boxShadow: "0px 0px 2px 0px rgba(0,0,0,0.25)",
                          backdropFilter: "blur(2px)",
                          paddingLeft: sv(2),
                        }}
                        aria-label={
                          index === 0
                            ? "Zoom in"
                            : index === 1
                              ? "Zoom out"
                              : "Fit view"
                        }
                        type="button"
                      >
                        <img
                          src={icon}
                          alt=""
                          style={{ width: sv(24), height: sv(24) }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div
                className="flex flex-col"
                style={{ gap: sv(24) }}
              >
                {inspectionItems.map((item, itemIndex) => (
                  <div
                    key={item.id}
                    className="flex flex-col"
                    style={{
                      borderTop: "0.5px solid rgba(0,0,0,0.1)",
                      paddingTop: sv(12),
                      paddingLeft: sv(16),
                      paddingRight: sv(16),
                    }}
                  >
                    <div
                      className="flex items-center"
                      style={{ gap: sv(16) }}
                    >
                      <div
                        className="flex items-center justify-center flex-shrink-0"
                        style={{
                          width: sv(24),
                          height: sv(24),
                          borderRadius: sv(2),
                          backgroundColor: "#262626",
                          color: "#ffffff",
                          fontSize: sv(16),
                          fontWeight: 700,
                          lineHeight: "normal",
                          fontFamily: "Arial, sans-serif",
                        }}
                      >
                        {item.id}
                      </div>
                      <p
                        className="m-0"
                        style={{
                          flex: 1,
                          fontSize: sv(14),
                          fontWeight: 300,
                          color: "#262626",
                          lineHeight: "normal",
                        }}
                      >
                        {item.description}
                      </p>
                    </div>
                    {item.media.length > 0 && (
                      <div
                        className="flex items-center"
                        style={{
                          gap: sv(4),
                          paddingLeft: sv(40),
                          paddingTop: sv(8),
                        }}
                      >
                        {item.media.map((media, mediaIndex) => {
                          const isVideo = media.type === "video";
                          return (
                            <button
                              key={`${item.id}-${mediaIndex}`}
                              onClick={() =>
                                openInspectionModal(itemIndex, mediaIndex)
                              }
                              className="relative flex items-center justify-center overflow-hidden flex-shrink-0"
                              style={{
                                width: sv(64),
                                height: sv(64),
                                borderRadius: sv(4),
                                border: isVideo
                                  ? `${sv(2)} solid #ffffff`
                                  : "none",
                                padding: isVideo ? 0 : sv(2),
                              }}
                            >
                              <img
                                src={media.thumbSrc ?? media.src}
                                alt=""
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  borderRadius: isVideo ? sv(4) : sv(2),
                                }}
                              />
                              {isVideo && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <img
                                    src={FENCE_VIDEO_PLAY_ICON}
                                    alt=""
                                    style={{
                                      width: sv(24),
                                      height: sv(24),
                                    }}
                                  />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {inspectionModal && (
        <InspectionDetailModal
          entries={inspectionItems}
          activeEntryIndex={inspectionModal.entryIndex}
          activeMediaIndex={inspectionModal.mediaIndex}
          onClose={() => setInspectionModal(null)}
          onChangeEntry={(entryIndex) =>
            setInspectionModal({ entryIndex, mediaIndex: 0 })
          }
          onChangeMedia={(mediaIndex) =>
            setInspectionModal((prev) =>
              prev ? { ...prev, mediaIndex } : prev,
            )
          }
          title={data.labels.inspectionModalTitle}
          contactSalesLabel={data.labels.inspectionModalContactLabel}
        />
      )}
    </div>
  );
}
