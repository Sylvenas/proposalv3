// ── Shared inline-SVG icons ─────────────────────────────────────────────────
// Why inline instead of <img src="…svg">: loading a small icon via <img>
// triggers a fresh network fetch on every component mount until the asset
// lands in the disk cache. That fetch is fast on a warm cache, but cold
// renders (first visit, hard reload, off-network) showed a perceptible
// half-second blank where the icon should be. Inlining the path eliminates
// that round-trip — the icon paints with the rest of the component on the
// first frame.

type IconProps = {
  /** Rendered height in px. Width follows the SVG's natural aspect ratio. */
  size?: number;
  /** Fill color for the path. Defaults to the project's primary ink (#262626). */
  fill?: string;
};

// Phone glyph. Natural viewBox 24×22 → width = size × 24/22.
export function PhoneIcon({ size = 16, fill = '#262626' }: IconProps = {}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 22"
      fill="none"
      style={{ width: (size * 24) / 22, height: size, flexShrink: 0 }}
    >
      <path
        d="M15.1634 13.9329L15.5605 13.5412L14.6384 12.6213L14.2414 13.013L15.1634 13.9329ZM16.8939 13.3771L18.5593 14.2754L19.1838 13.1357L17.5184 12.2374L16.8939 13.3771ZM18.8799 16.0606L17.6415 17.2822L18.5635 18.2021L19.8019 16.9805L18.8799 16.0606ZM16.887 17.6755C15.623 17.7924 12.353 17.6882 8.81254 14.1956L7.89056 15.1156C11.7541 18.9269 15.4314 19.113 17.0083 18.9672L16.887 17.6755ZM8.81254 14.1956C5.43773 10.8665 4.8787 8.06641 4.80911 6.85165L3.50362 6.92526C3.59119 8.45416 4.28341 11.5572 7.89056 15.1156L8.81254 14.1956ZM10.0114 8.85062L10.2615 8.60398L9.33951 7.68407L9.08949 7.9307L10.0114 8.85062ZM10.4605 5.46007L9.36126 4.00332L8.3145 4.78077L9.4137 6.23753L10.4605 5.46007ZM5.66423 3.68625L4.29596 5.03601L5.21794 5.95593L6.58621 4.60617L5.66423 3.68625ZM9.55047 8.39066C9.08949 7.9307 9.08887 7.93132 9.08824 7.93194C9.08803 7.93215 9.0874 7.93278 9.08697 7.9332C9.08612 7.93406 9.08525 7.93492 9.08437 7.93581C9.0826 7.9376 9.08077 7.93946 9.07888 7.9414C9.07511 7.94528 9.07112 7.94949 9.06692 7.95402C9.0585 7.96307 9.04927 7.97343 9.03939 7.98514C9.01962 8.00853 8.99723 8.03734 8.97369 8.0718C8.92651 8.1409 8.87509 8.23225 8.83146 8.34714C8.74243 8.58155 8.6947 8.89057 8.75454 9.27322C8.87156 10.0216 9.39103 11.0101 10.7217 12.3227L11.6437 11.4028C10.3984 10.1743 10.1018 9.42677 10.0467 9.07434C10.0204 8.90662 10.0476 8.82407 10.0551 8.80453C10.0597 8.79244 10.0618 8.7912 10.0563 8.79946C10.0535 8.8035 10.0488 8.80982 10.0416 8.81834C10.038 8.8226 10.0338 8.82743 10.0288 8.83281C10.0263 8.8355 10.0236 8.83833 10.0207 8.84129C10.0193 8.84278 10.0178 8.84429 10.0162 8.84585C10.0155 8.84663 10.0147 8.84742 10.0139 8.84821C10.0135 8.84861 10.0129 8.84921 10.0127 8.84941C10.0121 8.85002 10.0114 8.85062 9.55047 8.39066ZM10.7217 12.3227C12.0529 13.6358 13.0539 14.1469 13.8094 14.2619C14.1955 14.3206 14.5068 14.2737 14.7429 14.1865C14.8587 14.1437 14.9509 14.0932 15.0207 14.0469C15.0555 14.0237 15.0847 14.0017 15.1083 13.9822C15.1201 13.9725 15.1306 13.9634 15.1398 13.9551C15.1444 13.951 15.1487 13.9471 15.1526 13.9434C15.1546 13.9415 15.1564 13.9396 15.1582 13.9379C15.1591 13.937 15.16 13.9362 15.1609 13.9353C15.1613 13.9349 15.162 13.9343 15.1622 13.9341C15.1628 13.9335 15.1634 13.9329 14.7024 13.4729C14.2414 13.013 14.242 13.0124 14.2427 13.0117C14.2428 13.0116 14.2434 13.011 14.2439 13.0105C14.2447 13.0098 14.2454 13.009 14.2462 13.0082C14.2479 13.0067 14.2494 13.0053 14.2509 13.0038C14.2539 13.0009 14.2568 12.9983 14.2595 12.9958C14.2649 12.991 14.2698 12.9868 14.2741 12.9833C14.2827 12.9762 14.289 12.9717 14.293 12.969C14.3011 12.9637 14.2994 12.9661 14.2865 12.9708C14.2652 12.9787 14.1796 13.0058 14.0077 12.9796C13.6474 12.9248 12.8886 12.6308 11.6437 11.4028L10.7217 12.3227ZM9.36126 4.00332C8.4727 2.82575 6.72542 2.63942 5.66423 3.68625L6.58621 4.60617C7.04969 4.14895 7.87285 4.19549 8.3145 4.78077L9.36126 4.00332ZM4.80911 6.85165C4.79196 6.55232 4.93034 6.23964 5.21794 5.95593L4.29596 5.03601C3.82756 5.49807 3.45932 6.15216 3.50362 6.92526L4.80911 6.85165ZM17.6415 17.2822C17.402 17.5186 17.1452 17.6517 16.887 17.6755L17.0083 18.9672C17.6487 18.9079 18.1734 18.587 18.5635 18.2021L17.6415 17.2822ZM10.2615 8.60398C11.1197 7.75736 11.1835 6.41823 10.4605 5.46007L9.4137 6.23753C9.76544 6.70366 9.71314 7.31549 9.33951 7.68407L10.2615 8.60398ZM18.5593 14.2754C19.2722 14.6599 19.3833 15.564 18.8799 16.0606L19.8019 16.9805C20.9703 15.828 20.61 13.9048 19.1838 13.1357L18.5593 14.2754ZM15.5605 13.5412C15.8952 13.211 16.434 13.1292 16.8939 13.3771L17.5184 12.2374C16.5738 11.728 15.4015 11.8687 14.6384 12.6213L15.5605 13.5412Z"
        fill={fill}
      />
    </svg>
  );
}

// Document/report glyph — sheet of paper with a folded top-right corner and
// two content lines. Square viewBox 16×16.
export function DocumentIcon({ size = 16, fill = '#262626' }: IconProps = {}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      style={{ width: size, height: size, flexShrink: 0 }}
    >
      <path
        d="M3.5 2h6l3 3v8.5A1.5 1.5 0 0 1 11 15H3.5A1.5 1.5 0 0 1 2 13.5v-10A1.5 1.5 0 0 1 3.5 2Z"
        stroke={fill}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M9.5 2v3h3" stroke={fill} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M5 9h5M5 11.5h5" stroke={fill} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// Restart / refresh glyph — sourced from SVG Repo (filled circular arrow
// with an integrated triangular tip). viewBox is the original -7.5 0 32 32
// box; the path inherits the component's `fill` prop so it tracks the
// surrounding text color via `currentColor`.
export function RestartIcon({ size = 16, fill = '#262626' }: IconProps = {}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="-7.5 0 32 32"
      fill={fill}
      style={{ width: size, height: size, flexShrink: 0 }}
    >
      <path d="M15.88 13.84c-1.68-3.48-5.44-5.24-9.040-4.6l0.96-1.8c0.24-0.4 0.080-0.92-0.32-1.12-0.4-0.24-0.92-0.080-1.12 0.32l-1.96 3.64c0 0-0.44 0.72 0.24 1.040l3.64 1.96c0.12 0.080 0.28 0.12 0.4 0.12 0.28 0 0.6-0.16 0.72-0.44 0.24-0.4 0.080-0.92-0.32-1.12l-1.88-1.040c2.84-0.48 5.8 0.96 7.12 3.68 1.6 3.32 0.2 7.32-3.12 8.88-1.6 0.76-3.4 0.88-5.080 0.28s-3.040-1.8-3.8-3.4c-0.76-1.6-0.88-3.4-0.28-5.080 0.16-0.44-0.080-0.92-0.52-1.080-0.4-0.080-0.88 0.16-1.040 0.6-0.72 2.12-0.6 4.36 0.36 6.36s2.64 3.52 4.76 4.28c0.92 0.32 1.84 0.48 2.76 0.48 1.24 0 2.48-0.28 3.6-0.84 4.16-2 5.92-7 3.92-11.12z" />
    </svg>
  );
}

// Prohibition glyph (circle with a forward-leaning slash). Square viewBox 16×16.
export function NoSymbolIcon({ size = 16, fill = '#262626' }: IconProps = {}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      style={{ width: size, height: size, flexShrink: 0 }}
    >
      <circle cx="8" cy="8" r="6.5" stroke={fill} strokeWidth="1.4" />
      <line x1="3.5" y1="12.5" x2="12.5" y2="3.5" stroke={fill} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

// Calendar glyph. Square viewBox 16×16.
export function CalendarIcon({ size = 16, fill = '#262626' }: IconProps = {}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      style={{ width: size, height: size, flexShrink: 0 }}
    >
      <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" stroke={fill} strokeWidth="1.2" />
      <path d="M5 2.25v2.5M11 2.25v2.5M2.5 7h11" stroke={fill} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// Email glyph. Natural viewBox 24×22 → width = size × 24/22.
export function EmailIcon({ size = 16, fill = '#262626' }: IconProps = {}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 22"
      fill="none"
      style={{ width: (size * 24) / 22, height: size, flexShrink: 0 }}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.5 5C4.39543 5 3.5 5.89543 3.5 7V15C3.5 16.1046 4.39543 17 5.5 17H18.5C19.6046 17 20.5 16.1046 20.5 15V7C20.5 5.89543 19.6046 5 18.5 5H5.5ZM4.7 7C4.7 6.55817 5.05817 6.2 5.5 6.2H18.5C18.9418 6.2 19.3 6.55817 19.3 7V8.11108L12.4154 11.9969C12.1571 12.1427 11.8429 12.1427 11.5846 11.9969L4.7 8.11108V7ZM4.7 9.49056V15C4.7 15.4418 5.05817 15.8 5.5 15.8H18.5C18.9418 15.8 19.3 15.4418 19.3 15V9.49056L13.0049 13.0435C12.3819 13.3951 11.6181 13.3951 10.9951 13.0435L4.7 9.49056Z"
        fill={fill}
      />
    </svg>
  );
}
