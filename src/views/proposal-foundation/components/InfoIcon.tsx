import { sv } from "../shared";

export function InfoIcon() {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      className="flex-shrink-0 opacity-40"
      style={{ width: sv(14), height: sv(14) }}
    >
      <circle cx="7" cy="7" r="6.5" stroke="#262626" strokeWidth="1" />
      <path
        d="M7 6.5v3.5"
        stroke="#262626"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="7" cy="4.5" r="0.6" fill="#262626" />
    </svg>
  );
}
