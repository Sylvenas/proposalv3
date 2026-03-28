import {
  FENCE_DRAWING_MAP,
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
  FENCE_VIDEO_THUMB_1,
  FENCE_VIDEO_THUMB_2,
  FENCE_WARRANTY_IMG,
} from "./shared";
import type {
  InspectionEntry,
  ODAItem,
  ODAOption,
  PriceBreakdownItem,
  ProposalScopeGroup,
  ProposalV3Data,
  SummaryLineItem,
} from "./schema";
import { odaOptions as legacyOptions, odaProjectInfo as legacyProjectInfo } from "@/data/odaMockDataCopy";
import {
  CONTRACT_PAGES,
  FENCE_THUMB_CAP,
  FENCE_THUMB_GATE_1,
  FENCE_THUMB_GATE_3,
  FENCE_THUMB_PANEL,
  FENCE_THUMB_POST_INSERT,
} from "./shared";

const mkItem = (id: string, name: string, price: number, img: string): ODAItem => ({
  id,
  name,
  spec: "",
  price,
  previewImage: img,
});

const makeSummaryItem = (
  id: string,
  name: string,
  qty: string,
  unit: string,
  price: number,
  img: string,
): SummaryLineItem => ({
  name,
  qty,
  unit,
  price,
  thumbnailSrc: img,
  showChange: false,
  odaItem: mkItem(id, name, price, img),
});

const fenceScopeGroups: ProposalScopeGroup[] = [
  {
    name: "Fence Parts",
    items: [
      makeSummaryItem("fp-1", "Vinyl | Stratford | 4' | Panel | White", "17", "sec.", 2125, FENCE_THUMB_PANEL),
      makeSummaryItem("fp-2", "Vinyl | Stratford | 4' | End Post | White", "2", "pcs", 140, FENCE_THUMB_PANEL),
      makeSummaryItem("fp-3", "Vinyl | Stratford | 4' | Corner Post | White", "8", "pcs.", 520, FENCE_THUMB_PANEL),
      makeSummaryItem("fp-4", "Vinyl | Stratford | 4' | Line Post | White", "32", "pcs", 760, FENCE_THUMB_PANEL),
    ],
  },
  {
    name: "Gate",
    items: [
      makeSummaryItem("g-1", "Vinyl | Stratford | 4' | 5'W Gate | White", "1", "sets", 560, FENCE_THUMB_GATE_1),
      makeSummaryItem("g-2", "Vinyl | Stratford | 5' | 4'W Gate | White", "1", "sets", 520, FENCE_THUMB_GATE_1),
      makeSummaryItem("g-3", "Vinyl | Stratford | 5' | 5'W Gate | White", "1", "sets", 610, FENCE_THUMB_GATE_3),
    ],
  },
  {
    name: "Sections",
    items: [
      makeSummaryItem("sp-1", `7/8" x 8' CQ20 Galv Post`, "2", "pcs.", 90, FENCE_THUMB_PANEL),
      makeSummaryItem("sp-2", `5" x 5" Heavy Duty Post Stiffeners for 1 7/8" (2") Post`, "2", "pcs.", 120, FENCE_THUMB_PANEL),
    ],
  },
  {
    name: "Hardware",
    items: [
      makeSummaryItem("hw-1", `Vinyl | 5" New England Cap - White`, "18", "pcs.", 85, FENCE_THUMB_CAP),
      makeSummaryItem("hw-2", `Vinyl | 5"x5"x96" Aluminum Gate Post Insert`, "2", "pcs.", 140, FENCE_THUMB_POST_INSERT),
      makeSummaryItem("hw-3", "Vinyl | Std Latch - 1 Side - External - Keyed - Black", "1", "sets", 95, FENCE_THUMB_PANEL),
      makeSummaryItem("hw-4", "Vinyl | Std Self Close Adj Hinge - Pair - Black", "2", "pairs", 110, FENCE_THUMB_PANEL),
    ],
  },
  {
    name: "Additional Material",
    items: [makeSummaryItem("am-1", "Concrete 50 lb Bag", "20", "bags", 305, FENCE_THUMB_PANEL)],
  },
];

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

const defaultBreakdown: PriceBreakdownItem[] = [
  { label: "Materials & Installation", value: "$9,030" },
  { label: "Discount -5%", value: "$300" },
  { label: "Sales Tax & Fees", value: "$1,269" },
];

const defaultLegacyOptions = legacyOptions as unknown as Array<Omit<ODAOption, "summary" | "scopeGroups" | "detailSummary" | "approvedSummary">>;

const buildOption = (option: Omit<ODAOption, "summary" | "scopeGroups" | "detailSummary" | "approvedSummary">, index: number): ODAOption => {
  const summaryTitle = index === 0
    ? "OPTION 1 - CHAIN LINK FENCE"
    : index === 1
      ? "OPTION 2 - VINYL TRADITIONS FENCE"
      : option.title;
  const summaryDescription = index === 0
    ? "Durable / Low Maintenance / Cost-Effective Perimeter Security"
    : index === 1
      ? "Enhanced Privacy / Clean Appearance / Minimal Maintenance"
      : option.subtitle;
  const duration = index === 0
    ? "2–3 Weeks Estimated Construction Time"
    : index === 1
      ? "4–6 Weeks Estimated Construction Time"
      : `${option.deliveryDays} Days Estimated Construction Time`;
  const contractTotal = index === 0 ? "$8,615.00" : index === 1 ? "$9,999.00" : `$${option.priceFrom.toLocaleString()}.00`;
  const monthly = index === 0 ? "$404.13 / mo" : index === 1 ? "$469.06 / mo" : `$${option.monthlyPayment.toLocaleString()} / mo`;
  const scopeGroups = index === 1 ? fenceScopeGroups : [];
  return {
    ...option,
    summary: {
      title: summaryTitle,
      description: summaryDescription,
      duration,
      price: `${contractTotal} USD`,
      contractTotal,
      monthly,
      image: index === 0 ? option.images[0] : index === 1 ? option.images[1] ?? option.images[0] : option.images[0],
    },
    contractPages: [],
    scopeGroups,
    detailSummary: {
      title: `SUMMARY - ${summaryTitle}`,
      subtitle: "Henderson Backyard Fence",
      contractTotal,
      monthlyPayment: monthly,
      breakdown: defaultBreakdown,
    },
    approvedSummary: {
      title: "Fence Replacement - Henderson Backyard Fence",
      approvedOn: "Proposal Approved on 3/18/2026",
      paymentProgressLabel: "Payment Progress",
      paidAmount: "$4,998",
      totalAmount: "$9,999",
      progressPercent: 50,
      nextPaymentLabel: "Next Payment",
      nextPaymentAmount: "$4,999",
      nextPaymentDescription: "100% balance due at project completion <5/26/2028>",
    },
  };
};

export const defaultProposalV3Data: ProposalV3Data = {
  project: {
    contractorName: "Madison Fence Company",
    contractorAddress: "1268 Wilshire Boulevard, Suite 410, Santa Monica, CA 90403",
    contractorUrl: "https://www.gomadisonfence.com/",
    contractorPhone: "(310) 555-0126",
    contractorEmail: "service@madisonfence.com",
    contractorLicense: "License #CSLB 1098421",
    contractorStars: "4.6",
    contractorReviews: "(882 reviews)",
    testimonialQuotes: [
      "“The result feels custom in all the right ways. ODA Architecture helped us make smart choices on materials, finishes, and layout, and the whole experience felt far more seamless than we expected.”\n\n— Priya and Kevin S., Irvine, CA",
      "“ODA Architecture made the entire renovation process feel clear and intentional. We never felt overwhelmed, and every decision felt easier because the options were presented so thoughtfully.”\n\n— Emily R., Pasadena, CA",
      "“From design through final execution, ODA Architecture brought a level of care and clarity that gave us real confidence. The space feels elevated, functional, and much more aligned with how we actually live.”\n\n— Sophia L., Glendale, CA",
    ],
    projectName: "Henderson Backyard Fence",
    projectAddress: "1722 Willis Ave NW, Grand Rapids, MI 49504",
    salesName: "Leslie Cheung",
    salesTitle: "Senior Project Consultant",
    salesPhone: "(310) 555-0174",
    salesEmail: "leslie.cheung@oda-architecture.com",
    clientName: legacyProjectInfo.clientName,
    displayTitle: "FENCE REPLACEMENT PROPOSAL",
    proposalName: "Henderson Backyard Fence Replacement",
    proposalSlogan: "Build Your Dream Fence",
    emailImage: legacyProjectInfo.emailImage,
    heroImage: legacyProjectInfo.heroImage,
  },
  email: {
    fromLabel: "Madison Fence Company <service@madisonfence.com>",
    subject: "Your fence project proposal from Madison Fence",
    proposalLabel: "Henderson Backyard Fence Replacement",
    preparedByLabel: "Prepared by:",
    footerNotice: "You are receiving this email because Madison Fence Company generated a personalized proposal for your property.",
  },
  landing: {
    heroEyebrow: "Build Your Dream Fence",
    primaryButtonLabel: "INSPECTION REPORT",
    secondaryButtonLabel: "EXPLORE OPTIONS",
    validUntil: "Valid Until: April 30, 2026",
    stickyPrimaryButtonLabel: "Contact Sales",
    stickySecondaryButtonLabel: "Explore Options",
    inspectionSectionTitle: "INSPECTION REPORT",
    stickyTitle: "Henderson Backyard Fence",
    stickyAddress: "1722 Willis Ave NW, Grand Rapids, MI 49504",
    preparedForPrefix: "Prepared for",
    inspectionDrawing: "",
    inspectionItems,
    floorPlanMarkers: [
      { id: 1, x: "45.5%", y: "28.6%" },
      { id: 2, x: "66.9%", y: "29.7%" },
      { id: 3, x: "57.3%", y: "61.9%" },
      { id: 4, x: "76.5%", y: "23.8%" },
      { id: 5, x: "50.6%", y: "50.5%" },
    ],
  },
  optionsPage: {
    supportTitle: "Need support choosing a option?",
    supportBody: "Compare different options to help you decide which one fits you best.",
    compareButtonLabel: "Compare Options",
    scheduleTitle: "Schedule and Pricing",
    decisionTitle: "Decision made?",
    backToTopLabel: "Back to Top",
    selectButtonLabel: "Select",
    contractTotalLabel: "Contract Total",
    monthlyPaymentLabel: "Estimated Monthly Payment Starting at",
    constructionTimeLabel: "Estimated Construction Time",
  },
  detailPage: {
    reviewsCompanyName: "Madison Fence Company",
    reviewsScore: "4.6",
    reviewsCount: "(882 reviews)",
    reviewsUrl: "https://www.gomadisonfence.com/",
    reviews: [
      {
        quote:
          "\"I had such a great experience with Madison Fence Company! From start to finish, everything was handled so smoothly and professionally. Pei, the owner, is truly wonderful, knowledgeable, honest, and committed to making sure the job is done right. Junyu, who handles the scheduling, is equally fantastic, she's so organized, friendly, and always kept me updated, which made the whole process stress-free.\"",
        author: "— Aileen, Grand Rapids Michigan",
      },
      {
        quote:
          "\"First and foremost. I'd like to say this about Madison Fence Company. When I needed someone to come out and look at my fencing to get me a quote? Not only were they johnny on the spot with fast service the quote was extremely reasonable. Their workers were very courteous, professional and experienced. This company was and will always be my first choice for my home needs for fencing replacement and repairs. Thanks guys for being of great service.\"",
        author: "— Joe, Grand Rapids, Michigan",
      },
      {
        quote:
          "\"We had an outstanding experience from start to finish! The communication throughout the entire process was top notch! The team's knowledge and professionalism was excellent every step of the way. They helped guide us seamlessly through HOA and city requirements, which made the project stress free. Michael was fantastic. Mary in the office was always prompt and clear with updates. Henry, our project manager, was kind, knowledgeable, and incredibly helpful. Isaac, our installer, did an amazing job. The fence looks perfect and it was all completed in just two days. Truly a 10 out of 10 experience. Highly recommend!\"",
        author: "— Mary, Grand Rapids Michigan",
      },
    ],
    reviewsReadMoreLabel: "Read more",
    primaryActionLabel: "Sign & Approve",
    secondaryActionLabel: "Explore Payment & Financing",
    contactSalesLabel: "Contact Sales",
    downloadLabel: "Download Config [PDF]",
    inspectionReportLabel: "Inspection Report",
    changeOptionLabel: "Change Option",
    productsTitle: "All Included/Selected Products",
    drawingsTitle: "Drawings",
    contractTotalLabel: "Contract Total",
    monthlyPaymentLabel: "Estimated Monthly Payment",
    breakdownFootnotes: [
      "Total project pricing is subject to change based on applicable taxes, fees, payment timing, and any final project adjustments. The final amount presented at the time of payment will control.",
      "Any monthly payment information shown is an estimate only and is not a financing offer. Final payment amounts, interest rates, and loan terms are subject to lender review and will be confirmed during the formal application process.",
    ],
  },
  approvedPage: {
    tabs: [
      "Project Home",
      "Contract",
      "Documents",
      "Products",
      "Drawings",
      "Invoices & Payments",
    ],
    primaryActionLabel: "Make A Payment",
    secondaryActionLabel: "Financing Service",
    contactSalesLabel: "Contact Sales",
    downloadLabel: "Download Contract [PDF]",
    recordsLabel: "Payment Schedule & Records",
    footnotes: [
      "Total project pricing is subject to change based on applicable taxes, fees, payment timing, and any final project adjustments. The final amount presented at the time of payment will control.",
      "Any monthly payment information shown is an estimate only and is not a financing offer. Final payment amounts, interest rates, and loan terms are subject to lender review and will be confirmed during the formal application process.",
    ],
    readMoreLabel: "Read more",
    scopeTitle: "Approved Scope",
    drawingsTitle: "Drawings",
  },
  labels: {
    signModalTitle: "Sign Contract as",
    signModalDisclaimer: "Please review your final project selections and contract details before signing. By signing below, you confirm your acceptance of the scope, pricing, and terms outlined in this agreement.",
    signModalButtonLabel: "Sign",
    inspectionModalTitle: "INSPECTION DETAILS",
    inspectionModalContactLabel: "Contact Sales",
    productSelectLabel: "Select Product",
    productSelectedLabel: "Product Selected",
    changeLabel: "Change",
  },
  extraServices: [],
  contractPages: CONTRACT_PAGES,
  drawings: {
    detail: FENCE_DRAWING_MAP,
    approved: FENCE_DRAWING_MAP,
  },
  upsell: {
    warrantyImage: FENCE_WARRANTY_IMG,
  },
  options: defaultLegacyOptions.map(buildOption),
};
