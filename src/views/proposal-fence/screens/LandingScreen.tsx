import { useEffect, useRef, useState } from "react";

import { InspectionDetailModal } from "../components/InspectionDetailModal";
import {
  FENCE_FIT_ICON,
  FENCE_HERO_LOGO,
  FENCE_HOME_ICON,
  FENCE_NAV_LOGO,
  FENCE_PHONE_ICON,
  FENCE_REPORT_IMAGE_1,
  FENCE_REPORT_IMAGE_10,
  FENCE_REPORT_IMAGE_11,
  FENCE_REPORT_IMAGE_12,
  FENCE_REPORT_IMAGE_2,
  FENCE_REPORT_IMAGE_3,
  FENCE_REPORT_IMAGE_4,
  FENCE_REPORT_IMAGE_5,
  FENCE_REPORT_IMAGE_6,
  FENCE_REPORT_IMAGE_7,
  FENCE_REPORT_IMAGE_8,
  FENCE_REPORT_IMAGE_9,
  FENCE_REPORT_MAP_IMAGE,
  FENCE_USER_ICON,
  FENCE_VIDEO_PLAY_ICON,
  FENCE_VIDEO_THUMB_1,
  FENCE_VIDEO_THUMB_2,
  FENCE_ZOOM_IN_ICON,
  FENCE_ZOOM_OUT_ICON,
  type InspectionEntry,
  sv,
} from "../shared";

export function LandingScreen({
  onContinue,
  onHome,
}: {
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

  const inspectionItems: InspectionEntry[] = [
    {
      id: 1,
      title: "Walkthrough Video Record",
      description:
        "Walkthrough Video Record - A brief on-site walkthrough video was recorded during the inspection visit to document existing fence conditions, slope transitions, drainage concerns, and proposed gate location. This video is intended as a visual reference for the homeowner prior to final approval.",
      media: [
        { type: "video", src: FENCE_VIDEO_THUMB_1, thumbSrc: FENCE_VIDEO_THUMB_1 },
        { type: "video", src: FENCE_VIDEO_THUMB_2, thumbSrc: FENCE_VIDEO_THUMB_2 },
      ],
    },
    {
      id: 2,
      title: "Drainage Risk Area",
      description:
        "Drainage Risk Area - Water staining and softened soil were observed near the back-right corner adjacent to the downspout discharge area. This section may be vulnerable to long-term post movement if drainage is not improved. Recommend minor grading correction or extension of the drainage outlet prior to installation.",
      media: [
        { type: "image", src: FENCE_REPORT_IMAGE_1 },
        { type: "image", src: FENCE_REPORT_IMAGE_2 },
        { type: "image", src: FENCE_REPORT_IMAGE_3 },
      ],
    },
    {
      id: 3,
      title: "Soil condition Observation",
      description:
        "Soil condition Observation - rear and right-side yard show moderately compacted clay-heavy soil. Post-hole digging is expected to require additional effort, and concrete setting time may be slightly extended if moisture remains high near the lower section of the yard.",
      media: [
        { type: "image", src: FENCE_REPORT_IMAGE_4 },
        { type: "image", src: FENCE_REPORT_IMAGE_5 },
        { type: "image", src: FENCE_REPORT_IMAGE_6 },
      ],
    },
    {
      id: 4,
      title: "Existing Fence Removal Requirement",
      description:
        "Existing Fence Removal Requirement - Existing wood fence along the rear property line shows leaning posts, warped rails, and multiple deteriorated pickets. Full demolition and disposal of the current fence system is recommended before new installation.",
      media: [
        { type: "image", src: FENCE_REPORT_IMAGE_7 },
        { type: "image", src: FENCE_REPORT_IMAGE_8 },
      ],
    },
    {
      id: 5,
      title: "Property Line Verification Note",
      description:
        "Property Line Verification Note - Fence alignment shown in this proposal is based on visible site conditions and client guidance during walkthrough. Final installation should follow confirmed property boundaries. Survey verification is recommended if boundary location is uncertain.",
      media: [
        { type: "image", src: FENCE_REPORT_IMAGE_9 },
        { type: "image", src: FENCE_REPORT_IMAGE_10 },
        { type: "image", src: FENCE_REPORT_IMAGE_11 },
        { type: "image", src: FENCE_REPORT_IMAGE_12 },
      ],
    },
  ];

  const floorPlanMarkers = [
    { id: 1, x: "45.5%", y: "28.6%" },
    { id: 2, x: "66.9%", y: "29.7%" },
    { id: 3, x: "57.3%", y: "61.9%" },
    { id: 4, x: "76.5%", y: "23.8%" },
    { id: 5, x: "50.6%", y: "50.5%" },
  ];

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
      <img
        src={FENCE_NAV_LOGO}
        alt="Grand Rapids Fence"
        style={{ width: "auto", height: sv(100), objectFit: "contain" }}
      />
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
            <img
              src={FENCE_HERO_LOGO}
              alt="Grand Rapids Fence"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
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
              {"1722 Willis Ave NW, Grand Rapids, MI 49504 "}
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
              FENCE REPLACEMENT PROPOSAL
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
              {"Prepared for Michael Rozier "}
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
            Build Your Dream Fence
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
              INSPECTION REPORT
            </button>
            <button
              onClick={onContinue}
              className="flex items-center justify-center transition-opacity hover:opacity-85"
              style={{
                width: hsv(168),
                height: hsv(40),
                backgroundColor: "#F5A020",
                color: "#ffffff",
                fontSize: hsv(14),
                fontWeight: 600,
                lineHeight: hsv(18),
                cursor: "pointer",
              }}
            >
              EXPLORE OPTIONS
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
            Valid Until: April 30, 2026
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
                Henderson Backyard Fence
              </p>
              <p
                style={{
                  fontSize: sv(14),
                  fontWeight: 400,
                  color: "#262626",
                  lineHeight: "normal",
                }}
              >
                1722 Willis Ave NW, Grand Rapids, MI 49504
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
                <span>Contact Sales</span>
              </button>
              <button
                className="flex items-center justify-center"
                style={{
                  height: sv(40),
                  padding: `0 ${sv(16)}`,
                  backgroundColor: "#F5A020",
                  color: "white",
                  border: "none",
                  borderRadius: sv(4),
                  fontSize: sv(14),
                  fontWeight: 600,
                  lineHeight: "normal",
                }}
                onClick={onContinue}
              >
                Explore Options
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
                  INSPECTION REPORT
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
                      src={FENCE_REPORT_MAP_IMAGE}
                      alt="Fence inspection drawing"
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
        />
      )}
    </div>
  );
}
