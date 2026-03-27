export type ODAItem = {
  id: string;
  name: string;
  spec: string;
  price: number;
  quantity?: string;
  unit?: string;
  productImages?: string[];
  swatches?: string[];
  selectedSwatch?: number;
  swatchPrices?: number[];
  swatchProductImages?: string[][];
  isAddon?: boolean;
  selected?: boolean;
  previewImage?: string;
  addonSwatches?: string[];
  selectedAddonSwatch?: number;
  addonSwatchPrices?: number[];
};

export type ODASection = {
  name: string;
  items: ODAItem[];
  collapsed?: boolean;
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

export type ProposalScopeGroup = {
  name: string;
  items: SummaryLineItem[];
};

export type ProposalOptionSummary = {
  title: string;
  description: string;
  duration: string;
  price: string;
  contractTotal: string;
  monthly: string;
  image: string;
};

export type PriceBreakdownItem = {
  label: string;
  value: string;
};

export type ProposalReview = {
  quote: string;
  author: string;
};

export type ODAOption = {
  id: number;
  title: string;
  subtitle: string;
  materials: string[];
  deliveryDays: number;
  priceFrom: number;
  monthlyPayment: number;
  images: string[];
  sections: ODASection[];
  summary: ProposalOptionSummary;
  scopeGroups: ProposalScopeGroup[];
  detailSummary: {
    title: string;
    subtitle: string;
    contractTotal: string;
    monthlyPayment: string;
    breakdown: PriceBreakdownItem[];
  };
  approvedSummary: {
    title: string;
    approvedOn: string;
    paymentProgressLabel: string;
    paidAmount: string;
    totalAmount: string;
    progressPercent: number;
    nextPaymentLabel: string;
    nextPaymentAmount: string;
    nextPaymentDescription: string;
  };
};

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

export type ProposalV3Data = {
  project: {
    contractorName: string;
    contractorAddress: string;
    contractorUrl: string;
    contractorPhone: string;
    contractorEmail: string;
    contractorLicense: string;
    contractorStars: string;
    contractorLogo?: string;
    contractorLogoHeader?: string;
    contractorLogoProductFallback?: string;
    contractorReviews: string;
    testimonialQuotes: string[];
    projectName: string;
    projectAddress: string;
    salesName: string;
    salesTitle: string;
    salesPhone: string;
    salesEmail: string;
    clientName: string;
    displayTitle: string;
    proposalName: string;
    proposalSlogan: string;
    proposalCover?: string;
    emailImage: string;
    heroImage: string;
  };
  email: {
    fromLabel: string;
    subject: string;
    proposalLabel: string;
    preparedByLabel: string;
    footerNotice: string;
  };
  landing: {
    heroEyebrow: string;
    primaryButtonLabel: string;
    secondaryButtonLabel: string;
    validUntil: string;
    stickyPrimaryButtonLabel: string;
    stickySecondaryButtonLabel: string;
    inspectionSectionTitle: string;
    stickyTitle: string;
    stickyAddress: string;
    preparedForPrefix: string;
    inspectionDrawing: string;
    inspectionItems: InspectionEntry[];
    floorPlanMarkers: Array<{ id: number; x: string; y: string }>;
  };
  optionsPage: {
    supportTitle: string;
    supportBody: string;
    compareButtonLabel: string;
    scheduleTitle: string;
    decisionTitle: string;
    backToTopLabel: string;
    selectButtonLabel: string;
    contractTotalLabel: string;
    monthlyPaymentLabel: string;
    constructionTimeLabel: string;
  };
  detailPage: {
    reviewsCompanyName: string;
    reviewsScore: string;
    reviewsCount: string;
    reviewsUrl: string;
    reviews: ProposalReview[];
    reviewsReadMoreLabel: string;
    primaryActionLabel: string;
    secondaryActionLabel: string;
    contactSalesLabel: string;
    downloadLabel: string;
    inspectionReportLabel: string;
    breakdownFootnotes: string[];
    changeOptionLabel: string;
    productsTitle: string;
    drawingsTitle: string;
    contractTotalLabel: string;
    monthlyPaymentLabel: string;
  };
  approvedPage: {
    tabs: string[];
    primaryActionLabel: string;
    secondaryActionLabel: string;
    contactSalesLabel: string;
    downloadLabel: string;
    recordsLabel: string;
    footnotes: string[];
    readMoreLabel: string;
    scopeTitle: string;
    drawingsTitle: string;
  };
  labels: {
    signModalTitle: string;
    signModalDisclaimer: string;
    signModalButtonLabel: string;
    inspectionModalTitle: string;
    inspectionModalContactLabel: string;
    productSelectLabel: string;
    productSelectedLabel: string;
    changeLabel: string;
  };
  contractPages: string[];
  drawings: {
    detail: string;
    approved: string;
  };
  upsell: {
    warrantyImage: string;
  };
  options: ODAOption[];
};
