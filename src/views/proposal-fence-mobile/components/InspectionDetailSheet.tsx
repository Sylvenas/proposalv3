"use client";

import { useState } from "react";

import {
  FENCE_VIDEO_PLAY_ICON,
  type InspectionEntry,
} from "@/views/proposal-fence/shared";

export function InspectionDetailSheet({
  entries,
  activeEntryIndex,
  activeMediaIndex,
  onClose,
  onChangeEntry,
  onChangeMedia,
}: {
  entries: InspectionEntry[];
  activeEntryIndex: number;
  activeMediaIndex: number;
  onClose: () => void;
  onChangeEntry: (idx: number) => void;
  onChangeMedia: (idx: number) => void;
}) {
  const entry = entries[activeEntryIndex];
  const media = entry.media[activeMediaIndex];
  const totalEntries = entries.length;
  const totalMedia = entry.media.length;

  return (
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
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "48px 16px 12px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            backgroundColor: "rgba(38,38,38,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#ffffff",
            }}
          >
            {activeEntryIndex + 1}
          </span>
        </div>
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#ffffff",
            flex: 1,
            textAlign: "center",
            marginLeft: 8,
            marginRight: 8,
          }}
        >
          {entry.title}
        </span>
        <button
          onClick={onClose}
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
            <path
              d="M1 1l12 12M13 1L1 13"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Main media display */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <img
          src={media.thumbSrc ?? media.src}
          alt=""
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
        />
        {media.type === "video" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img src={FENCE_VIDEO_PLAY_ICON} alt="" style={{ width: 28, height: 28 }} />
            </div>
          </div>
        )}

        {/* Prev / Next media */}
        {activeMediaIndex > 0 && (
          <button
            onClick={() => onChangeMedia(activeMediaIndex - 1)}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: "rgba(0,0,0,0.55)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <svg viewBox="0 0 14 14" fill="none" style={{ width: 14, height: 14 }}>
              <path
                d="M9 2L4 7l5 5"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        {activeMediaIndex < totalMedia - 1 && (
          <button
            onClick={() => onChangeMedia(activeMediaIndex + 1)}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: "rgba(0,0,0,0.55)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <svg viewBox="0 0 14 14" fill="none" style={{ width: 14, height: 14 }}>
              <path
                d="M5 2l5 5-5 5"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Bottom panel */}
      <div
        style={{
          backgroundColor: "#1a1a1a",
          padding: "16px 16px 24px",
          flexShrink: 0,
        }}
      >
        {/* Media thumbnails */}
        {totalMedia > 1 && (
          <div
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              marginBottom: 12,
              scrollbarWidth: "none",
            }}
          >
            {entry.media.map((m, mIdx) => (
              <button
                key={mIdx}
                onClick={() => onChangeMedia(mIdx)}
                style={{
                  flexShrink: 0,
                  width: 56,
                  height: 56,
                  borderRadius: 6,
                  overflow: "hidden",
                  border: `2px solid ${mIdx === activeMediaIndex ? "#F5A020" : "transparent"}`,
                  padding: 0,
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                <img
                  src={m.thumbSrc ?? m.src}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </button>
            ))}
          </div>
        )}

        {/* Description */}
        <p
          style={{
            fontSize: 13,
            fontWeight: 300,
            color: "rgba(255,255,255,0.8)",
            lineHeight: 1.5,
            marginBottom: 16,
          }}
        >
          {entry.description}
        </p>

        {/* Entry navigation */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <button
            onClick={() => activeEntryIndex > 0 && onChangeEntry(activeEntryIndex - 1)}
            disabled={activeEntryIndex === 0}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              height: 36,
              padding: "0 12px",
              borderRadius: 6,
              backgroundColor: activeEntryIndex === 0 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.15)",
              border: "none",
              color: activeEntryIndex === 0 ? "rgba(255,255,255,0.3)" : "white",
              fontSize: 13,
              cursor: activeEntryIndex === 0 ? "default" : "pointer",
            }}
          >
            <svg viewBox="0 0 14 14" fill="none" style={{ width: 12, height: 12 }}>
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Prev
          </button>

          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
            {activeEntryIndex + 1} / {totalEntries}
          </span>

          <button
            onClick={() => activeEntryIndex < totalEntries - 1 && onChangeEntry(activeEntryIndex + 1)}
            disabled={activeEntryIndex === totalEntries - 1}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              height: 36,
              padding: "0 12px",
              borderRadius: 6,
              backgroundColor: activeEntryIndex === totalEntries - 1 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.15)",
              border: "none",
              color: activeEntryIndex === totalEntries - 1 ? "rgba(255,255,255,0.3)" : "white",
              fontSize: 13,
              cursor: activeEntryIndex === totalEntries - 1 ? "default" : "pointer",
            }}
          >
            Next
            <svg viewBox="0 0 14 14" fill="none" style={{ width: 12, height: 12 }}>
              <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
