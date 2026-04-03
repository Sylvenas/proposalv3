import { THUMB_BASE_SCOPE, type ODAItem } from "@/data/odaMockDataFence";

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
export const INSPECTION_REPORT_IMAGE_1 =
  "/assets/figma-local/a9f6d074-8b60-421d-b834-eb390a876bf4-adaf8d9422.jpg";
export const INSPECTION_REPORT_IMAGE_2 =
  "/assets/figma-local/8bf4ece5-237e-42ab-b756-e842e4093c6e-6bb9bdf761.jpg";
export const INSPECTION_REPORT_IMAGE_3 =
  "/assets/figma-local/400d4e67-59c3-423a-9416-600c82e4e24d-2f5e887f60.png";
export const INSPECTION_REPORT_IMAGE_4 =
  "/assets/figma-local/411fdc2e-0d4a-4899-957e-d7cf93525672-6f405a0e7f.png";
export const INSPECTION_REPORT_IMAGE_5 =
  "/assets/figma-local/cf0f30fb-4654-49fb-8b6c-9121f88e352b-9f30eb9e71.png";
export const INSPECTION_REPORT_IMAGE_6 =
  "/assets/figma-local/89e35ce2-be01-47f2-b097-d938fc738300-f89e359ebf.png";
export const INSPECTION_REPORT_IMAGE_7 =
  "/assets/figma-local/fab24a9f-a481-4283-963d-5003d9ae168d-7701ebdfbf.png";
export const INSPECTION_REPORT_IMAGE_8 =
  "/assets/figma-local/5a2ab62f-2406-43f6-b3a2-8a3af77e6ce6-3123c2f005.png";
export const INSPECTION_VIDEO_ICON =
  "/assets/figma-local/7acf45ae-fdae-49ab-9554-5d71be8157fc-b9adcd46f8.svg";
export const FENCE_REPORT_MAP_IMAGE =
  "/assets/figma-local/7ecdfa62-2a1c-46e9-95d9-2917edb47626-4296a497c5.png";
export const FENCE_VIDEO_THUMB_1 =
  "/assets/figma-local/03bea55b-22fd-4fa1-9d7a-538a799d39c9-e15fc39124.png";
export const FENCE_VIDEO_THUMB_2 =
  "/assets/figma-local/e6cef6d6-048f-4a8c-8ebd-3c9dae0e0d6a-e6053e1a51.png";
export const FENCE_REPORT_IMAGE_1 =
  "/assets/figma-local/fce12163-f53d-418a-9837-783fed716a4f-0fb666855d.png";
export const FENCE_REPORT_IMAGE_2 =
  "/assets/figma-local/9fe3f401-d10a-4568-abd7-9a095ee4331d-ba5f6d380b.png";
export const FENCE_REPORT_IMAGE_3 =
  "/assets/figma-local/8a172b75-ba04-4c77-897b-0d6ac8dec986-5857d9a3f5.png";
export const FENCE_REPORT_IMAGE_4 =
  "/assets/figma-local/3a669088-338c-4a6a-a257-523c64b4f94c-900677c61a.png";
export const FENCE_REPORT_IMAGE_5 =
  "/assets/figma-local/0257875c-a8c9-43cd-ba8c-a037a2168aec-93773f7a43.png";
export const FENCE_REPORT_IMAGE_6 =
  "/assets/figma-local/63ebf90e-4739-41ca-8ffc-44e1bb499e30-63650129cb.png";
export const FENCE_REPORT_IMAGE_7 =
  "/assets/figma-local/df655b70-f276-4fac-b41c-f58ff3341076-df691fee8c.png";
export const FENCE_REPORT_IMAGE_8 =
  "/assets/figma-local/ff80bcd2-83d1-4c33-bc96-04521ac9fdb2-f6f4658116.png";
export const FENCE_REPORT_IMAGE_9 =
  "/assets/figma-local/dc8d5c73-a157-4942-84c5-272449c26511-e96713c581.png";
export const FENCE_REPORT_IMAGE_10 =
  "/assets/figma-local/525533a5-8619-4d55-962f-96ab64da650f-b25e2d8a5b.png";
export const FENCE_REPORT_IMAGE_11 =
  "/assets/figma-local/604881f7-32e5-4ecf-81c1-440cd804eeb8-8518666e45.png";
export const FENCE_REPORT_IMAGE_12 =
  "/assets/figma-local/b35dc5d5-4cc7-4350-93a8-ccc61a6d7b05-9961aa633f.png";
export const FENCE_HERO_LOGO = "/assets/grand-rapids-fence-logo.png";
export const FENCE_NAV_LOGO = "/assets/grand-rapids-fence-logo.png";
export const FENCE_ZOOM_IN_ICON =
  "/assets/figma-local/e3c306b7-b20f-4b57-bf85-59e38b1f6932-e2b6136576.svg";
export const FENCE_ZOOM_OUT_ICON =
  "/assets/figma-local/3571920d-fc78-4728-a3dd-e07f3e23b040-b929c87335.svg";
export const FENCE_FIT_ICON =
  "/assets/figma-local/10de511b-aea0-4cb1-8b63-b2e134299c01-95dfa8c9b5.svg";
export const FENCE_VIDEO_PLAY_ICON =
  "/assets/figma-local/ead193d8-2453-4cbc-8eb3-8f5b45cc21b6-3a028e07bc.svg";
export const FENCE_PHONE_ICON =
  "/assets/figma-local/3ed348af-ff7a-48b8-99b8-93ec3082e23f-2616cf1a6f.svg";
export const FENCE_HOME_ICON =
  "/assets/figma-local/e71d420a-1b53-4a10-baad-4d92f787ca2d-7d8bb73ca7.svg";
export const FENCE_USER_ICON =
  "/assets/figma-local/67ec092e-9b3f-4e5e-bdf6-04af373f05f6-97149766fa.svg";
export const OPTION_CARD_IMAGE_1 =
  "/assets/figma-local/b3a2fca2-f15b-4fb4-9709-eb448f7e7d19-0fd1b446fe.png";
export const OPTION_CARD_IMAGE_2 =
  "/assets/figma-local/65787a1a-2075-401b-891f-18a2e00f57eb-dfac981e26.png";
export const OPTION_LOGO_IMAGE =
  "/assets/figma-local/2d66bc15-bb7b-46b6-9877-769f911daab7-f7ce0f3462.png";
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
export const OPTION_CHAIN_PLACEHOLDER =
  "/assets/figma-local/cdd35f48-c738-4aa0-9be8-564fdab0b479-c26c079d24.png";
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

// ─── Fence Option 2 assets ────────────────────────────────────────────────────
export const FENCE_DRAWING_MAP = "/assets/fence-drawing-map.png";
export const FENCE_THUMB_PANEL = "/assets/fence-thumb-panel.png";   // Fence Parts, Sections, some Hardware
export const FENCE_THUMB_GATE_1 = "/assets/fence-thumb-gate-1.png"; // Gate items 1 & 2
export const FENCE_THUMB_GATE_3 = "/assets/fence-thumb-gate-3.png"; // Gate item 3 (5' 5'W)
export const FENCE_THUMB_CAP = "/assets/fence-thumb-cap.png";       // New England Cap
export const FENCE_THUMB_POST_INSERT = "/assets/fence-thumb-post-insert.png"; // Aluminum Gate Post Insert
export const FENCE_WARRANTY_IMG = "/assets/fence-extended-warranty.jpg";      // Fence Extended Warranty promo card

export const PLACEHOLDER_PRODUCT_IMAGES = new Set([
  OPTION_CHAIN_PLACEHOLDER,
  THUMB_BASE_SCOPE,
  FENCE_THUMB_PANEL,
]);

export const CONTRACT_PAGES = [
  "/pdf2/Madison Fence - Rozier - Option 2 - Approved_页面_1 1.png",
  "/pdf2/Madison Fence - Howland_页面_2 2.png",
  "/pdf2/Madison Fence - Rozier - Option 2 - Approved_页面_3 1.png",
  "/pdf2/Madison Fence - Rozier - Option 2 - Approved_页面_4 1.png",
];
export const EMAIL_CONTENT_LOGO =
  "https://www.figma.com/api/mcp/asset/e182eb12-f01c-4deb-a581-866053874a4c";
export const PRODUCT_DETAIL_EMPTY_LOGO =
  "https://www.figma.com/api/mcp/asset/851b002b-204b-43ec-9e80-70ecd0b77d17";

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
