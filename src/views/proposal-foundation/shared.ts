import { THUMB_BASE_SCOPE, type ODAItem } from "@/data/odaMockDataFoundation";

// Scale helper: pure CSS clamp — no JS resize listener needed, zero jitter
export const sv = (px: number) => `calc(${px} / 1440 * clamp(1280px, 100vw, 2560px))`;

export const COMPARE_BASE_SCOPE =
  "/assets/figma-local/51981941-368d-42cc-b857-4efc43e45491-088570687b.jpg";
export const COMPARE_INFO_ICON =
  "/assets/figma-local/18c9139d-35d9-423f-bba5-b49a22d84866-aa9029ccd2.svg";
export const INSPECTION_CLOSE_ICON =
  "/assets/figma-local/2f985f51-8ed2-4b21-a3f4-6ea1b0c78488-e43bc55b91.svg";
export const INSPECTION_PHONE_ICON =
  "/assets/figma-local/0f6108b8-708f-4590-af43-3a49d4fe79ca-e0bccc251f.svg";
export const INSPECTION_PLACEHOLDER_LOGO =
  "/assets/figma-local/686f232d-6dfd-49f8-9717-5fff486d34ed-placeholder.png";
export const INSPECTION_ARROW_LEFT =
  "/assets/figma-local/23565d5b-0bdd-410a-89b9-c2c63bc82c1a-arrow-left.svg";
export const INSPECTION_ARROW_RIGHT =
  "/assets/figma-local/381b6246-be61-4e66-b4b2-2e62e81c316d-arrow-right.svg";
export const INSPECTION_REPORT_IMAGE_1 = "/assets/inspection/crack-assessment-1.png";
export const INSPECTION_REPORT_IMAGE_2 = "/assets/inspection/crack-assessment-1.png";
export const INSPECTION_REPORT_IMAGE_3 = "/assets/inspection/crack-assessment-1.png";
export const INSPECTION_REPORT_IMAGE_4 = "/assets/inspection/settling-door-frame.webp";
export const INSPECTION_REPORT_IMAGE_5 = "/assets/inspection/settling-floor-laser.png";
export const INSPECTION_REPORT_IMAGE_6 = "/assets/inspection/settling-floor-laser.png";
export const INSPECTION_REPORT_IMAGE_7 = "/assets/inspection/water-intrusion.png";
export const INSPECTION_REPORT_IMAGE_8 = "/assets/inspection/water-intrusion.png";
export const INSPECTION_VIDEO_ICON =
  "/assets/figma-local/7acf45ae-fdae-49ab-9554-5d71be8157fc-b9adcd46f8.svg";
export const FOUNDATION_REPORT_MAP_IMAGE = "/assets/foundation-drawing.png";
// Walkthrough video thumbnails
export const FOUNDATION_VIDEO_THUMB_1 = "/assets/inspection/walkthrough-video-thumb.png";
export const FOUNDATION_VIDEO_THUMB_2 = "/assets/inspection/walkthrough-video-thumb.png";
// Crack Assessment (3 slots, 1 unique image)
export const FOUNDATION_REPORT_IMAGE_1 = "/assets/inspection/crack-assessment-1.png";
export const FOUNDATION_REPORT_IMAGE_2 = "/assets/inspection/crack-assessment-1.png";
export const FOUNDATION_REPORT_IMAGE_3 = "/assets/inspection/crack-assessment-1.png";
// Settling Evidence (3 slots, 2 unique images)
export const FOUNDATION_REPORT_IMAGE_4 = "/assets/inspection/settling-door-frame.webp";
export const FOUNDATION_REPORT_IMAGE_5 = "/assets/inspection/settling-floor-laser.png";
export const FOUNDATION_REPORT_IMAGE_6 = "/assets/inspection/settling-floor-laser.png";
// Water Intrusion (2 slots, 1 unique image)
export const FOUNDATION_REPORT_IMAGE_7 = "/assets/inspection/water-intrusion.png";
export const FOUNDATION_REPORT_IMAGE_8 = "/assets/inspection/water-intrusion.png";
// Structural Evaluation (4 slots, 2 unique images)
export const FOUNDATION_REPORT_IMAGE_9 = "/assets/inspection/structural-drywall-crack.png";
export const FOUNDATION_REPORT_IMAGE_10 = "/assets/inspection/structural-pier.png";
export const FOUNDATION_REPORT_IMAGE_11 = "/assets/inspection/structural-drywall-crack.png";
export const FOUNDATION_REPORT_IMAGE_12 = "/assets/inspection/structural-pier.png";
export const FOUNDATION_HERO_LOGO = "/assets/bosterra-logo.png";
export const FOUNDATION_NAV_LOGO = "/assets/bosterra-logo.png";
export const FOUNDATION_ZOOM_IN_ICON =
  "/assets/figma-local/e3c306b7-b20f-4b57-bf85-59e38b1f6932-e2b6136576.svg";
export const FOUNDATION_ZOOM_OUT_ICON =
  "/assets/figma-local/3571920d-fc78-4728-a3dd-e07f3e23b040-b929c87335.svg";
export const FOUNDATION_FIT_ICON =
  "/assets/figma-local/10de511b-aea0-4cb1-8b63-b2e134299c01-95dfa8c9b5.svg";
export const FOUNDATION_VIDEO_PLAY_ICON =
  "/assets/figma-local/ead193d8-2453-4cbc-8eb3-8f5b45cc21b6-3a028e07bc.svg";
export const FOUNDATION_PHONE_ICON =
  "/assets/figma-local/3ed348af-ff7a-48b8-99b8-93ec3082e23f-2616cf1a6f.svg";
export const FOUNDATION_HOME_ICON =
  "/assets/figma-local/e71d420a-1b53-4a10-baad-4d92f787ca2d-7d8bb73ca7.svg";
export const FOUNDATION_USER_ICON =
  "/assets/figma-local/67ec092e-9b3f-4e5e-bdf6-04af373f05f6-97149766fa.svg";
export const OPTION_CARD_IMAGE_1 = "/assets/cable-lock.webp";
export const OPTION_CARD_IMAGE_2 = "/assets/urethane-injection.png";
export const OPTION_LOGO_IMAGE = "/assets/bosterra-logo.png";
export const OPTION_COMPARE_ICON =
  "/assets/figma-local/8c28d037-63ce-4e99-8acc-b89fdcb25640-2a5cf4bf8d.svg";
export const OPTION_STICKY_CHEVRON =
  "/assets/figma-local/fd10f897-2826-49a3-85fa-44e822913e0b-cadf1ade6b.svg";
export const OPTION_BACK_TO_TOP_ICON =
  "/assets/figma-local/ef5e1ae1-49b9-4aca-ab37-0f9f45ce4b7d-a1eca606f9.svg";
export const OPTION_HOME_ICON =
  "/assets/figma-local/d2a15d78-aa7f-41da-8bee-c1e50e844b7c-69be7a1678.svg";
export const OPTION_USER_ICON =
  "/assets/figma-local/be7b996d-c6ef-489c-8ceb-6741da1b14ee-440bae599f.svg";
export const OPTION_INFO_ICON =
  "/assets/figma-local/028a1418-0005-4ead-b04c-f9e8becd5138-7f07ab0078.svg";
export const OPTION_CHAIN_PLACEHOLDER = "/assets/bosterra-logo.png";
export const OPTION_GATE_IMAGE_1 =
  "/assets/figma-local/79ed251c-3b2d-4fd9-82a7-345238d8ddc3-63fef2806a.png";
export const OPTION_GATE_IMAGE_2 =
  "/assets/figma-local/7feffa04-1d2f-41fc-be91-d12652497028-ad8cf843e0.jpg";
export const OPTION_GATE_IMAGE_3 =
  "/assets/figma-local/5bb7f9ab-a34b-486c-8f8a-07ef4e7ab8d0-e43c1b13ab.jpg";
export const OPTION_GATE_IMAGE_4 =
  "/assets/figma-local/f338dfae-ca24-4729-9f1a-640e850eb79f-78668dc38f.png";
export const OPTION_HARDWARE_IMAGE_1 =
  "/assets/figma-local/0eef5329-de03-48c1-9d20-768a934e16f2-2542bbfbee.png";
export const OPTION_HARDWARE_IMAGE_2 =
  "/assets/figma-local/a282e3db-8386-44c2-bd88-6e355d32d6a3-936e67bc86.png";
export const OPTION_HARDWARE_IMAGE_3 =
  "/assets/figma-local/99a0c2e2-dfcd-4e0b-9424-3691a356f35f-21072c80f6.jpg";
export const OPTION_HARDWARE_IMAGE_4 =
  "/assets/figma-local/e7066310-7033-4824-891c-dcbd0a945c76-51e46a783f.png";
export const OPTION_HARDWARE_IMAGE_5 =
  "/assets/figma-local/f0177215-9498-4bb4-85c3-8c33ede13fcd-cee8dd5495.png";

// ─── Foundation-specific assets ───────────────────────────────────────────────
export const FOUNDATION_DRAWING_MAP = "/assets/foundation-drawing.png";
export const FOUNDATION_THUMB_PIER = "/assets/thumb-base-scope.jpg";
export const FOUNDATION_THUMB_INJECTION = "/assets/thumb-base-scope.jpg";
export const FOUNDATION_WARRANTY_IMG = "/assets/fence-extended-warranty.jpg";

export const PLACEHOLDER_PRODUCT_IMAGES = new Set([
  OPTION_CHAIN_PLACEHOLDER,
  THUMB_BASE_SCOPE,
  FOUNDATION_THUMB_PIER,
]);

export const CONTRACT_PDF = "/assets/pickering-approved.pdf";
export const CONTRACT_PAGES = [CONTRACT_PDF];
export const EMAIL_CONTENT_LOGO = "/assets/bosterra-logo.png";
export const PRODUCT_DETAIL_EMPTY_LOGO = "/assets/bosterra-logo.png";

export function isPlaceholderProductImage(src?: string | null) {
  return Boolean(src && PLACEHOLDER_PRODUCT_IMAGES.has(src));
}

export function getItemPrice(item: ODAItem): number {
  if (!item.isAddon) {
    return item.swatchPrices?.[item.selectedSwatch ?? 0] ?? item.price;
  } else {
    return (
      item.addonSwatchPrices?.[item.selectedAddonSwatch ?? 0] ?? item.price
    );
  }
}

export type Screen = "email" | "landing" | "options" | "detail" | "approved";
export const VALID_SCREENS: Screen[] = [
  "email",
  "landing",
  "options",
  "detail",
  "approved",
];

export function formatPrice(n: number) {
  return "$" + n.toLocaleString();
}

export type InspectionMedia = {
  type: "image" | "video";
  src: string;
  thumbSrc?: string;
};

export type InspectionEntry = {
  id: number;
  title: string;
  description: string;
  media: InspectionMedia[];
};

export type SummaryLineItem = {
  name: string;
  qty: string;
  unit: string;
  price: number;
  thumbnailSrc?: string;
  showChange?: boolean;
  description?: string;
  odaItem?: ODAItem;
  sectionName?: string;
  sectionItems?: ODAItem[];
};
