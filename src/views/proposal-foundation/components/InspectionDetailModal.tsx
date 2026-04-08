import Image from "next/image";

import {
  INSPECTION_ARROW_LEFT,
  INSPECTION_ARROW_RIGHT,
  INSPECTION_CLOSE_ICON,
  INSPECTION_PHONE_ICON,
  INSPECTION_PLACEHOLDER_LOGO,
  INSPECTION_VIDEO_ICON,
  type InspectionEntry,
  sv,
} from "../shared";

export function InspectionDetailModal({
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
  onChangeEntry: (index: number) => void;
  onChangeMedia: (index: number) => void;
}) {
  const entry = entries[activeEntryIndex];
  if (!entry) return null;
  const media = entry.media[activeMediaIndex] ?? entry.media[0] ?? null;
  const hasPrev = activeEntryIndex > 0;
  const hasNext = activeEntryIndex < entries.length - 1;

  return (
    <div
      className="fixed inset-0 z-[220] flex flex-col items-center justify-end"
      style={{
        paddingTop: sv(113),
        backdropFilter: "blur(10px)",
        backgroundColor: "rgba(0,0,0,0.6)",
      }}
      onClick={onClose}
    >
      <div
        className="bg-white flex flex-col items-start w-full"
        style={{
          height: sv(767),
          borderTopLeftRadius: sv(16),
          borderTopRightRadius: sv(16),
          boxShadow:
            "0px 2px 4px 0px rgba(0,0,0,0.12), 0px 4px 24px 0px rgba(0,0,0,0.2)",
          gap: sv(16),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-end w-full"
          style={{
            paddingTop: sv(16),
            paddingLeft: sv(16),
            paddingRight: sv(16),
          }}
        >
          <button
            onClick={onClose}
            className="bg-[#f0f0f0] flex items-center justify-center hover:opacity-80 transition-opacity"
            style={{ width: sv(24), height: sv(24), borderRadius: sv(4) }}
          >
            <img
              src={INSPECTION_CLOSE_ICON}
              alt=""
              style={{ width: sv(10.506), height: sv(10.506) }}
            />
          </button>
        </div>
        <div
          className="flex items-start w-full flex-1 min-h-0"
          style={{ gap: sv(40), paddingLeft: sv(64), paddingRight: sv(64) }}
        >
          <div
            className="flex flex-col justify-between h-full flex-shrink-0"
            style={{ width: sv(840), paddingBottom: sv(24) }}
          >
            <div
              className="relative overflow-hidden flex items-center justify-center"
              style={{
                width: "100%",
                height: sv(510),
                borderRadius: sv(8),
                border: media ? "none" : "1px solid #b4b4b4",
              }}
            >
              {media ? (
                <>
                  <Image
                    src={media.src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="840px"
                  />
                  {media.type === "video" && (
                    <div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      style={{ backgroundColor: "rgba(0,0,0,0.14)" }}
                    >
                      <img
                        src={INSPECTION_VIDEO_ICON}
                        alt=""
                        style={{ width: sv(72), height: sv(72) }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <img
                  src={INSPECTION_PLACEHOLDER_LOGO}
                  alt="Bosterra, Inc."
                  style={{ width: sv(252), height: sv(49) }}
                />
              )}
            </div>
            <div className="flex items-center w-full" style={{ gap: sv(8) }}>
              {entry.media.map((item, index) => {
                const isActive = index === activeMediaIndex;
                return (
                  <button
                    key={`${entry.id}-${index}`}
                    onClick={() => onChangeMedia(index)}
                    className="flex flex-col items-start"
                    style={{
                      width: sv(86),
                      height: sv(64),
                      padding: sv(2),
                      borderRadius: sv(4),
                      border: isActive
                        ? "1.5px solid #000000"
                        : "1.5px solid transparent",
                    }}
                  >
                    <div
                      className="relative flex-1 w-full overflow-hidden"
                      style={{ borderRadius: sv(2) }}
                    >
                      <Image
                        src={item.thumbSrc ?? item.src}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="86px"
                      />
                      {item.type === "video" && (
                        <div
                          className="absolute inset-0 flex items-center justify-center pointer-events-none"
                          style={{ backgroundColor: "rgba(0,0,0,0.08)" }}
                        >
                          <img
                            src={INSPECTION_VIDEO_ICON}
                            alt=""
                            style={{ width: sv(20), height: sv(20) }}
                          />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <div
            className="flex flex-col flex-1 min-w-0 h-full"
            style={{ gap: sv(24), paddingBottom: sv(127) }}
          >
            <div
              className="flex flex-col flex-1 min-h-0"
              style={{ gap: sv(32) }}
            >
              <div className="flex flex-col w-full" style={{ gap: sv(16) }}>
                <p
                  className="font-semibold text-[#262626]"
                  style={{
                    fontSize: sv(20),
                    letterSpacing: sv(-0.8),
                    lineHeight: "normal",
                  }}
                >
                  INSPECTION DETAILS
                </p>
                <div
                  className="bg-[#262626] flex items-center justify-center"
                  style={{ width: sv(32), height: sv(32), borderRadius: sv(2) }}
                >
                  <p
                    style={{
                      fontSize: sv(16),
                      color: "#ffffff",
                      lineHeight: "normal",
                    }}
                  >
                    {entry.id}
                  </p>
                </div>
                <div
                  className="text-[#262626]"
                  style={{
                    fontSize: sv(14),
                    fontWeight: 300,
                    lineHeight: "normal",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {entry.description}
                </div>
              </div>
              <button
                className="bg-white border border-transparent flex items-center justify-center transition-colors hover:border-[#262626] active:bg-[#ebebeb]"
                style={{
                  width: sv(132),
                  height: sv(40),
                  borderRadius: sv(4),
                  gap: sv(2),
                  color: "rgba(0,0,0,0.85)",
                  fontSize: sv(14),
                  cursor: "pointer",
                }}
              >
                <img
                  src={INSPECTION_PHONE_ICON}
                  alt=""
                  style={{ width: sv(24), height: sv(22) }}
                />
                <span>Contact Sales</span>
              </button>
            </div>
            <div
              className="flex items-center w-full"
              style={{ gap: sv(21) }}
            >
              <button
                onClick={() => hasPrev && onChangeEntry(activeEntryIndex - 1)}
                className="flex-shrink-0 flex items-center justify-center transition-opacity"
                style={{
                  width: sv(48),
                  height: sv(48),
                  opacity: hasPrev ? 1 : 0.3,
                  cursor: hasPrev ? "pointer" : "default",
                }}
              >
                <img
                  src={INSPECTION_ARROW_LEFT}
                  alt="Previous"
                  style={{ width: sv(48), height: sv(48), transform: "rotate(180deg)" }}
                />
              </button>
              <p
                className="flex-1 text-center text-[#262626]"
                style={{
                  fontSize: sv(20),
                  fontWeight: 300,
                  letterSpacing: "-0.8px",
                  lineHeight: "normal",
                }}
              >
                {activeEntryIndex + 1} / {entries.length}
              </p>
              <button
                onClick={() => hasNext && onChangeEntry(activeEntryIndex + 1)}
                className="flex-shrink-0 flex items-center justify-center transition-opacity"
                style={{
                  width: sv(48),
                  height: sv(48),
                  opacity: hasNext ? 1 : 0.3,
                  cursor: hasNext ? "pointer" : "default",
                }}
              >
                <img
                  src={INSPECTION_ARROW_RIGHT}
                  alt="Next"
                  style={{ width: sv(48), height: sv(48) }}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
