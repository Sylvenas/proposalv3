"use client";

import { useEffect, useRef, useState } from "react";

import {
  FENCE_HERO_LOGO,
  FENCE_NAV_LOGO,
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
  FENCE_VIDEO_THUMB_1,
  FENCE_VIDEO_THUMB_2,
  FENCE_VIDEO_PLAY_ICON,
  type InspectionEntry,
} from "@/views/proposal-fence/shared";
import { InspectionDetailSheet } from "../components/InspectionDetailSheet";
import { PinchZoom } from "../components/PinchZoom";

export function LandingScreen({
  onContinue,
}: {
  onContinue: () => void;
  onHome?: () => void;
}) {
  const heroActionsRef = useRef<HTMLDivElement>(null);
  const inspectionSectionRef = useRef<HTMLDivElement>(null);
  const [heroActionsVisible, setHeroActionsVisible] = useState(true);
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [inspectionModal, setInspectionModal] = useState<{
    entryIndex: number;
    mediaIndex: number;
  } | null>(null);

  // Detect when hero CTA buttons scroll out of view
  useEffect(() => {
    const el = heroActionsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHeroActionsVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scrollToInspection = () => {
    inspectionSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const inspectionItems: InspectionEntry[] = [
    {
      id: 1,
      title: "Walkthrough Video Record",
      description:
        "A brief on-site walkthrough video was recorded during the inspection visit to document existing fence conditions, slope transitions, drainage concerns, and proposed gate location.",
      media: [
        { type: "video", src: FENCE_VIDEO_THUMB_1, thumbSrc: FENCE_VIDEO_THUMB_1 },
        { type: "video", src: FENCE_VIDEO_THUMB_2, thumbSrc: FENCE_VIDEO_THUMB_2 },
      ],
    },
    {
      id: 2,
      title: "Drainage Risk Area",
      description:
        "Water staining and softened soil were observed near the back-right corner adjacent to the downspout discharge area. Recommend minor grading correction or extension of the drainage outlet prior to installation.",
      media: [
        { type: "image", src: FENCE_REPORT_IMAGE_1 },
        { type: "image", src: FENCE_REPORT_IMAGE_2 },
        { type: "image", src: FENCE_REPORT_IMAGE_3 },
      ],
    },
    {
      id: 3,
      title: "Soil Condition Observation",
      description:
        "Rear and right-side yard show moderately compacted clay-heavy soil. Post-hole digging is expected to require additional effort, and concrete setting time may be slightly extended.",
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
        "Existing wood fence along the rear property line shows leaning posts, warped rails, and multiple deteriorated pickets. Full demolition and disposal is recommended before new installation.",
      media: [
        { type: "image", src: FENCE_REPORT_IMAGE_7 },
        { type: "image", src: FENCE_REPORT_IMAGE_8 },
      ],
    },
    {
      id: 5,
      title: "Property Line Verification Note",
      description:
        "Fence alignment shown in this proposal is based on visible site conditions and client guidance. Survey verification is recommended if boundary location is uncertain.",
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

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
        backgroundColor: "#ffffff",
        minHeight: "100dvh",
      }}
    >
      {/* ── Hero section ── */}
      <section
        style={{
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 24px",
          backgroundColor: "#ffffff",
          color: "#262626",
          textAlign: "center",
        }}
      >
        {/* Logo */}
        <img
          src={FENCE_HERO_LOGO}
          alt="Grand Rapids Fence"
          style={{ width: 140, height: 140, objectFit: "contain", flexShrink: 0 }}
        />

        <div style={{ height: 32 }} />

        {/* Title block */}
        <p
          style={{
            fontSize: 13,
            fontWeight: 300,
            lineHeight: 1.4,
            margin: 0,
            color: "#737373",
          }}
        >
          1722 Willis Ave NW, Grand Rapids, MI 49504
        </p>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 300,
            letterSpacing: "-0.4px",
            margin: "10px 0 0",
            lineHeight: 1.25,
          }}
        >
          FENCE REPLACEMENT
          <br />
          PROPOSAL
        </h1>
        <p
          style={{
            fontSize: 13,
            fontWeight: 300,
            margin: "10px 0 0",
            color: "#737373",
          }}
        >
          Prepared for Michael Rozier
        </p>

        <div style={{ height: 40 }} />

        {/* Sub-heading */}
        <p style={{ fontSize: 14, fontWeight: 300, margin: 0 }}>
          Build Your Dream Fence
        </p>

        <div style={{ height: 20 }} />

        {/* CTA buttons */}
        <div
          ref={heroActionsRef}
          style={{ display: "flex", gap: 8, width: "100%" }}
        >
          <button
            onClick={scrollToInspection}
            style={{
              flex: 1,
              height: 46,
              border: "1px solid #262626",
              backgroundColor: "white",
              color: "rgba(0,0,0,0.85)",
              fontSize: 13,
              fontWeight: 400,
              cursor: "pointer",
              borderRadius: 4,
            }}
          >
            INSPECTION REPORT
          </button>
          <button
            onClick={onContinue}
            style={{
              flex: 1,
              height: 46,
              backgroundColor: "#F5A020",
              border: "none",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              borderRadius: 4,
            }}
          >
            EXPLORE OPTIONS
          </button>
        </div>

        <div style={{ height: 12 }} />

        {/* Valid until */}
        <p style={{ fontSize: 13, fontWeight: 300, color: "#737373", margin: 0 }}>
          Proposal Valid Until: April 30, 2026
        </p>
      </section>

      {/* ── Sticky mini-nav (shows when hero CTA is out of view) ── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          backgroundColor: "white",
          borderBottom: "0.5px solid rgba(0,0,0,0.1)",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          opacity: heroActionsVisible ? 0 : 1,
          pointerEvents: heroActionsVisible ? "none" : "auto",
          transition: "opacity 0.2s ease",
        }}
      >
        <img
          src={FENCE_NAV_LOGO}
          alt="Grand Rapids Fence"
          style={{ height: 36, width: "auto", objectFit: "contain" }}
        />
        <button
          onClick={onContinue}
          style={{
            height: 36,
            padding: "0 16px",
            backgroundColor: "#F5A020",
            border: "none",
            color: "white",
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Explore Options
        </button>
      </div>

      {/* ── Inspection section ── */}
      <section
        ref={inspectionSectionRef}
        style={{
          padding: "24px 16px",
          paddingBottom: heroActionsVisible ? 24 : 96,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Section heading */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <p
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#262626",
              margin: 0,
            }}
          >
            INSPECTION REPORT
          </p>
        </div>

        {/* Project info card */}
        <div
          style={{
            backgroundColor: "#f7f7f7",
            borderRadius: 12,
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <p style={{ fontSize: 15, fontWeight: 600, color: "#262626", margin: 0 }}>
            Henderson Backyard Fence
          </p>
          <p style={{ fontSize: 13, color: "#737373", margin: 0 }}>
            1722 Willis Ave NW, Grand Rapids, MI 49504
          </p>
        </div>

        {/* Site map with markers */}
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "4/3",
            overflow: "hidden",
            borderRadius: 10,
            backgroundColor: "#f0f0f0",
          }}
        >
          <img
            src={FENCE_REPORT_MAP_IMAGE}
            alt="Fence inspection map"
            style={{
              position: "absolute",
              width: "197.75%",
              height: "381.45%",
              left: "-56.4%",
              top: "-140.73%",
              maxWidth: "none",
              pointerEvents: "none",
            }}
          />
          {floorPlanMarkers.map((marker) => (
            <button
              key={marker.id}
              onClick={() => setInspectionModal({ entryIndex: marker.id - 1, mediaIndex: 0 })}
              style={{
                position: "absolute",
                left: marker.x,
                top: marker.y,
                transform: "translate(-50%, -50%)",
                width: 36,
                height: 36,
                borderRadius: 4,
                backgroundColor: "#262626",
                color: "white",
                fontSize: 16,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                fontFamily: "Arial, sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              type="button"
            >
              {marker.id}
            </button>
          ))}
          {/* Expand to full map */}
          <button
            onClick={() => setMapFullscreen(true)}
            style={{
              position: "absolute",
              bottom: 10,
              right: 10,
              width: 36,
              height: 36,
              borderRadius: 6,
              backgroundColor: "rgba(0,0,0,0.6)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" style={{ width: 18, height: 18 }}>
              <path
                d="M4 9V4h5M4 4l6 6M20 9V4h-5m5 0l-6 6M4 15v5h5m-5 0l6-6M20 15v5h-5m5 0l-6-6"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Tap-to-expand inspection items */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {inspectionItems.map((item, idx) => (
            <div
              key={item.id}
              style={{
                borderTop: "0.5px solid rgba(0,0,0,0.1)",
              }}
            >
              {/* Accordion header */}
              <button
                onClick={() => setOpenAccordion(openAccordion === idx ? null : idx)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  width: "100%",
                  padding: "14px 0",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
                type="button"
              >
                {/* Number badge */}
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 4,
                    backgroundColor: "#262626",
                    color: "white",
                    fontSize: 13,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontFamily: "Arial, sans-serif",
                  }}
                >
                  {item.id}
                </div>
                <span
                  style={{
                    flex: 1,
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#262626",
                    lineHeight: 1.4,
                  }}
                >
                  {item.title}
                </span>
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{
                    width: 16,
                    height: 16,
                    flexShrink: 0,
                    transform: openAccordion === idx ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                    marginTop: 4,
                  }}
                >
                  <path
                    d="M6 4l4 4-4 4"
                    stroke="#737373"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Accordion body */}
              {openAccordion === idx && (
                <div
                  style={{
                    paddingBottom: 16,
                    paddingLeft: 38,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 300,
                      color: "#262626",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {item.description}
                  </p>
                  {item.media.length > 0 && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {item.media.map((media, mIdx) => (
                        <button
                          key={mIdx}
                          onClick={() => setInspectionModal({ entryIndex: idx, mediaIndex: mIdx })}
                          style={{
                            width: 72,
                            height: 72,
                            borderRadius: 6,
                            overflow: "hidden",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            position: "relative",
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={media.thumbSrc ?? media.src}
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                          {media.type === "video" && (
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "rgba(0,0,0,0.3)",
                              }}
                            >
                              <img src={FENCE_VIDEO_PLAY_ICON} alt="" style={{ width: 24, height: 24 }} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Fixed bottom CTA (shows when hero CTA scrolled away) ── */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "12px 16px",
          paddingBottom: "max(12px, env(safe-area-inset-bottom))",
          backgroundColor: "white",
          borderTop: "0.5px solid rgba(0,0,0,0.08)",
          zIndex: 30,
          opacity: heroActionsVisible ? 0 : 1,
          pointerEvents: heroActionsVisible ? "none" : "auto",
          transition: "opacity 0.2s ease",
        }}
      >
        <button
          onClick={onContinue}
          style={{
            width: "100%",
            height: 52,
            borderRadius: 10,
            backgroundColor: "#F5A020",
            border: "none",
            color: "white",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: "-0.3px",
          }}
        >
          Explore Options →
        </button>
      </div>

      {/* ── Map fullscreen with pinch-to-zoom ── */}
      {mapFullscreen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            backgroundColor: "#111",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "48px 16px 12px",
              flexShrink: 0,
            }}
          >
            <p style={{ fontSize: 14, fontWeight: 600, color: "white", margin: 0 }}>
              Inspection Map
            </p>
            <button
              onClick={() => setMapFullscreen(false)}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.15)",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <svg viewBox="0 0 14 14" fill="none" style={{ width: 14, height: 14 }}>
                <path d="M1 1l12 12M13 1L1 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <PinchZoom style={{ flex: 1 }}>
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
              }}
            >
              <img
                src={FENCE_REPORT_MAP_IMAGE}
                alt="Fence inspection map"
                style={{
                  position: "absolute",
                  width: "197.75%",
                  height: "381.45%",
                  left: "-56.4%",
                  top: "-140.73%",
                  maxWidth: "none",
                }}
              />
              {floorPlanMarkers.map((marker) => (
                <button
                  key={marker.id}
                  onClick={() => {
                    setMapFullscreen(false);
                    setInspectionModal({ entryIndex: marker.id - 1, mediaIndex: 0 });
                  }}
                  style={{
                    position: "absolute",
                    left: marker.x,
                    top: marker.y,
                    transform: "translate(-50%, -50%)",
                    width: 36,
                    height: 36,
                    borderRadius: 4,
                    backgroundColor: "#262626",
                    color: "white",
                    fontSize: 16,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "Arial, sans-serif",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  type="button"
                >
                  {marker.id}
                </button>
              ))}
            </div>
          </PinchZoom>
          <p
            style={{
              textAlign: "center",
              color: "rgba(255,255,255,0.4)",
              fontSize: 12,
              padding: "10px 0",
              paddingBottom: "max(10px, env(safe-area-inset-bottom))",
              flexShrink: 0,
            }}
          >
            Pinch to zoom · Tap markers for details
          </p>
        </div>
      )}

      {/* ── Inspection detail sheet ── */}
      {inspectionModal && (
        <InspectionDetailSheet
          entries={inspectionItems}
          activeEntryIndex={inspectionModal.entryIndex}
          activeMediaIndex={inspectionModal.mediaIndex}
          onClose={() => setInspectionModal(null)}
          onChangeEntry={(idx) => setInspectionModal({ entryIndex: idx, mediaIndex: 0 })}
          onChangeMedia={(mIdx) => setInspectionModal((prev) => prev ? { ...prev, mediaIndex: mIdx } : prev)}
        />
      )}
    </div>
  );
}
