// ─────────────────────────────────────────────────────────────────────────────
// SvgIcons.tsx — compatibility shims
// ─────────────────────────────────────────────────────────────────────────────
// Backed by the new icon set in `./icons` (sourced from the Arctuition Design
// Library + audition section). The old `<PhoneIcon size={n}/>` callsites
// remain unchanged; this file maps them onto the new components.
//
// Size mapping (per design direction — only 16 and 24 are supported):
//   size ≤ 19  →  16
//   size ≥ 20  →  24
// ─────────────────────────────────────────────────────────────────────────────

import {
  DateIcon,
  Mail,
  Phone,
  Redo,
  Report,
  Unavailable,
} from './icons';

type IconProps = {
  /** Rendered display size in px. Capped to 16 or 24 (rounds at 20). */
  size?: number;
  /** Fill color. Defaults to the project's primary ink (#262626). */
  fill?: string;
};

const round = (s: number): 16 | 24 => (s >= 20 ? 24 : 16);

export function PhoneIcon({ size = 16, fill = '#262626' }: IconProps = {}) {
  return <Phone size={round(size)} color={fill} />;
}

export function DocumentIcon({ size = 16, fill = '#262626' }: IconProps = {}) {
  return <Report size={round(size)} color={fill} />;
}

/**
 * RestartIcon — counter-clockwise restart arrow. Implemented as the DL `Redo`
 * icon flipped horizontally per the audition spec.
 */
export function RestartIcon({ size = 16, fill = '#262626' }: IconProps = {}) {
  return <Redo size={round(size)} color={fill} flipH />;
}

export function NoSymbolIcon({ size = 16, fill = '#262626' }: IconProps = {}) {
  return <Unavailable size={round(size)} color={fill} />;
}

export function CalendarIcon({ size = 16, fill = '#262626' }: IconProps = {}) {
  return <DateIcon size={round(size)} color={fill} />;
}

export function EmailIcon({ size = 16, fill = '#262626' }: IconProps = {}) {
  return <Mail size={round(size)} color={fill} />;
}
