import JSZip from "jszip";
import * as XLSX from "xlsx";

import type {
  ExtraService,
  InspectionEntry,
  InspectionMedia,
  ODAItem,
  ODAOption,
  ODASection,
  PriceBreakdownItem,
  ProposalOptionSummary,
  ProposalScopeGroup,
  ProposalV3Data,
  SummaryLineItem,
} from "./schema";

const REQUIRED_PROPOSAL_FIELDS = [
  "Contractor Name",
  "Contractor Phone",
  "Contractor Email",
  "Project Name",
  "Sales Name",
  "Sales Email",
  "Client Name",
  "Display Title (on PDF/COVER)",
  "Proposal Name",
] as const;

const MONTH_NAMES: Record<string, string> = {
  jan: "January", feb: "February", mar: "March", apr: "April",
  may: "May", jun: "June", jul: "July", aug: "August",
  sep: "September", oct: "October", nov: "November", dec: "December",
};

const normalize = (value: string) => value.trim().toLowerCase();

const formatCurrency = (value: number) =>
  `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const asText = (value: unknown) => {
  if (value == null) return "";
  return String(value).trim();
};

const asNumber = (value: unknown) => {
  if (typeof value === "number") return value;
  const text = asText(value).replace(/[$,\s]/g, "");
  if (!text) return 0;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : 0;
};

/** Extract numeric part from a monthly payment string like "$500 / mo" or "500" */
const parseMonthlyAmount = (value: string): number => {
  if (!value) return 0;
  const match = value.replace(/[$,]/g, "").match(/[\d]+(?:\.\d+)?/);
  if (!match) return 0;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : 0;
};

function getSheetRows(workbook: XLSX.WorkBook, sheetName: string): unknown[][] {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
    raw: false,
  }) as unknown[][];
}

/** col A → key, value = colB || colC */
function buildFieldMap(rows: unknown[][]) {
  const map = new Map<string, string>();
  for (const row of rows) {
    const key = asText(row[0]);
    if (!key || key === "Data") continue;
    const value1 = asText(row[1]);
    const value2 = asText(row[2]);
    map.set(key, value1 || value2);
  }
  return map;
}

/** col A → key, value = [colB, colC] (both preserved) */
function buildFieldMapDual(rows: unknown[][]) {
  const map = new Map<string, [string, string]>();
  for (const row of rows) {
    const key = asText(row[0]);
    if (!key || key === "Data") continue;
    map.set(key, [asText(row[1]), asText(row[2])]);
  }
  return map;
}

function extractImageRefs(value: string | undefined | null) {
  if (!value) return [];
  // Split by commas or whitespace — XLSX converts Alt+Enter cell line breaks to spaces,
  // so we must handle both. File names must not contain spaces.
  return value.split(/[,\s]+/).map((part) => part.trim()).filter(Boolean);
}

function buildImageLookup(zip: JSZip) {
  const map = new Map<string, JSZip.JSZipObject>();
  for (const [path, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;
    // Accept both "image/" and "images/" folder conventions
    const lp = path.toLowerCase();
    if (!lp.includes("image/") && !lp.includes("images/")) continue;
    const base = path.split("/").pop();
    if (!base) continue;
    map.set(normalize(base), entry);
    map.set(normalize(path), entry);
  }
  return map;
}

/** Lookup that covers ALL files in the ZIP (used for PDFs, contracts, etc.) */
function buildFileLookup(zip: JSZip) {
  const map = new Map<string, JSZip.JSZipObject>();
  for (const [path, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;
    const base = path.split("/").pop();
    if (!base) continue;
    map.set(normalize(base), entry);
    map.set(normalize(path), entry);
  }
  return map;
}

async function resolveOneFile(
  ref: string | undefined,
  fileLookup: Map<string, JSZip.JSZipObject>,
  errors: string[],
): Promise<string | undefined> {
  if (!ref) return undefined;
  const entry = fileLookup.get(normalize(ref));
  if (!entry) {
    errors.push(`Missing file: ${ref}`);
    return undefined;
  }
  const blob = await entry.async("blob");
  return URL.createObjectURL(blob);
}

async function resolveImageUrls(
  refs: string[],
  imageLookup: Map<string, JSZip.JSZipObject>,
  errors: string[],
) {
  const urls: string[] = [];
  for (const ref of refs) {
    const entry = imageLookup.get(normalize(ref)) ?? imageLookup.get(normalize(`images/${ref}`));
    if (!entry) {
      errors.push(`Missing image file: ${ref}`);
      continue;
    }
    const blob = await entry.async("blob");
    urls.push(URL.createObjectURL(blob));
  }
  return urls;
}

async function resolveOneImage(
  ref: string | undefined,
  imageLookup: Map<string, JSZip.JSZipObject>,
  errors: string[],
): Promise<string | undefined> {
  if (!ref) return undefined;
  const urls = await resolveImageUrls([ref], imageLookup, errors);
  return urls[0];
}

function parseOptionIndex(name: string) {
  const match = name.match(/^Option\s+(\d+)\s+Products$/i);
  return match ? Number(match[1]) : null;
}

function groupByCategory(items: SummaryLineItem[]) {
  const groups = new Map<string, SummaryLineItem[]>();
  for (const item of items) {
    const name = item.sectionName ?? "";
    const existing = groups.get(name);
    if (existing) {
      existing.push(item);
    } else {
      groups.set(name, [item]);
    }
  }
  return Array.from(groups.entries()).map(
    ([name, groupItems]): ProposalScopeGroup => ({
      name,
      items: groupItems.map(({ sectionName, ...rest }) => rest),
    }),
  );
}

function buildSections(groups: ProposalScopeGroup[]): ODASection[] {
  return groups.map((group) => ({
    name: group.name,
    items: group.items.map((item, index) => item.odaItem ?? {
      id: `${group.name}-${index}`,
      name: item.name,
      spec: item.description ?? "",
      price: item.price,
      quantity: item.qty,
      unit: item.unit,
      previewImage: item.thumbnailSrc,
      productImages: item.thumbnailSrc ? [item.thumbnailSrc] : [],
    }),
  }));
}

function formatExpirationDate(raw: string): string {
  const parts = raw.split(/[-/]/);
  if (parts.length < 3) return `Valid Until: ${raw}`;

  let day: string;
  let monthAbbr: string;
  let yearPart: string;

  if (/^\d+$/.test(parts[0]) && /^\d+$/.test(parts[2])) {
    if (MONTH_NAMES[parts[1].toLowerCase()]) {
      day = parts[0]; monthAbbr = parts[1]; yearPart = parts[2];
    } else {
      monthAbbr = parts[0]; day = parts[1]; yearPart = parts[2];
    }
  } else if (MONTH_NAMES[parts[0].toLowerCase()]) {
    monthAbbr = parts[0]; day = parts[1]; yearPart = parts[2];
  } else {
    day = parts[0]; monthAbbr = parts[1]; yearPart = parts[2];
  }

  const monthFull = MONTH_NAMES[monthAbbr.toLowerCase()] ?? monthAbbr;
  const fullYear = yearPart.length === 2 ? `20${yearPart}` : yearPart;
  return `Valid Until: ${monthFull} ${parseInt(day, 10)}, ${fullYear}`;
}

function extractBreakdownItems(dualMap: Map<string, [string, string]>): PriceBreakdownItem[] {
  const items: PriceBreakdownItem[] = [];
  for (let i = 1; i <= 10; i++) {
    const pair = dualMap.get(`Breakdown ${i}`);
    if (!pair) continue;
    const [label, value] = pair;
    if (label && value) items.push({ label, value });
  }
  return items;
}

function collectNumberedFields(fieldMap: Map<string, string>, prefix: string, max = 10): string[] {
  const result: string[] = [];
  for (let i = 1; i <= max; i++) {
    const value = fieldMap.get(`${prefix} ${i}`);
    if (value) result.push(value);
  }
  return result;
}

async function parseInspectionSheet(
  workbook: XLSX.WorkBook,
  imageLookup: Map<string, JSZip.JSZipObject>,
  errors: string[],
): Promise<InspectionEntry[]> {
  const rows = getSheetRows(workbook, "Inspection Report");
  if (rows.length <= 1) return [];
  const [, ...dataRows] = rows;
  const entries: InspectionEntry[] = [];
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const description = asText(row[0]);
    if (!description) continue;
    const dashIdx = description.indexOf(" - ");
    const dotIdx = description.indexOf(".");
    let title: string;
    if (dashIdx > 0 && dashIdx < 80) {
      title = description.slice(0, dashIdx).trim();
    } else if (dotIdx > 0 && dotIdx < 80) {
      title = description.slice(0, dotIdx).trim();
    } else {
      title = description.slice(0, 60).trim();
    }

    const imageRefs = extractImageRefs(asText(row[1]));
    const imageUrls = await resolveImageUrls(imageRefs, imageLookup, errors);
    const media: InspectionMedia[] = imageUrls.map((src) => ({ type: "image", src }));

    entries.push({ id: i + 1, title, description, media });
  }
  return entries;
}

/** Helper: get field from fieldMap, trying key with and without trailing space */
function field(fieldMap: Map<string, string>, key: string): string {
  return fieldMap.get(key) ?? fieldMap.get(`${key} `) ?? fieldMap.get(key.trimEnd()) ?? "";
}

// ────────────────────────────────────────────────────────────────────────────
// Main import — builds ProposalV3Data purely from Excel, NO fallback defaults
// ────────────────────────────────────────────────────────────────────────────

export async function importProposalZip(file: File): Promise<ProposalV3Data> {
  try {
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const excelEntry = Object.values(zip.files).find(
      (entry) => !entry.dir && /\.(xlsx|xlsm|xls)$/i.test(entry.name),
    );

    if (!excelEntry) {
      throw new Error("Zip 文件中未找到 Excel 文件。");
    }

    const workbook = XLSX.read(await excelEntry.async("arraybuffer"), { type: "array" });
    const proposalRows = getSheetRows(workbook, "Proposal Data");
    if (proposalRows.length === 0) {
      throw new Error('Excel 中缺少 "Proposal Data" sheet。');
    }

    const fieldMap = buildFieldMap(proposalRows);
    const dualMap = buildFieldMapDual(proposalRows);
    const missingRequired = REQUIRED_PROPOSAL_FIELDS.filter((f) => !fieldMap.get(f));
    if (missingRequired.length > 0) {
      throw new Error(`Proposal Data 缺少必填字段: ${missingRequired.join(", ")}`);
    }

    const imageLookup = buildImageLookup(zip);
    const fileLookup = buildFileLookup(zip);
    const errors: string[] = [];

    // ── Resolve logo/cover images ──
    const contractorLogo = await resolveOneImage(field(fieldMap, "Contractor Logo"), imageLookup, errors);
    const contractorLogoHeader = await resolveOneImage(field(fieldMap, "Contractor Logo Header"), imageLookup, errors);
    const contractorLogoProductFallback = await resolveOneImage(
      field(fieldMap, "Contractor Logo Product Thumbnail Fallback") || field(fieldMap, "Contractor Logo Product Fallback"),
      imageLookup, errors,
    );
    const proposalCover = await resolveOneImage(field(fieldMap, "Proposal Cover (Optional)"), imageLookup, errors);
    // Email cover is optional — missing is not an error, falls back to contractor logo
    const emailCoverErrors: string[] = [];
    const emailCover = await resolveOneImage(field(fieldMap, "Email Cover (Optional)"), imageLookup, emailCoverErrors);

    // ── Inspection Drawing ──
    const inspectionDrawing = await resolveOneImage(field(fieldMap, "Inspection Drawing"), imageLookup, errors);

    // ── Project ──
    const contractorName = field(fieldMap, "Contractor Name");
    const contractorEmail = field(fieldMap, "Contractor Email");
    const projectName = field(fieldMap, "Project Name");
    const displayTitle = field(fieldMap, "Display Title (on PDF/COVER)");
    const proposalName = field(fieldMap, "Proposal Name");
    const proposalSlogan = field(fieldMap, "Proposal Featuring/Slogan");
    const contractorUrl = field(fieldMap, "Contractor URL");
    // Note: Excel uses "Contractor Starts" (typo for Stars) — kept consistent with the template
    const contractorStars = field(fieldMap, "Contractor Starts");
    const contractorReviews = field(fieldMap, "Contractor Reviews");

    // ── Testimonial Quotes (up to 3 in standard template) ──
    const testimonialQuotes = collectNumberedFields(fieldMap, "Testimonial Quotes", 3);

    // ── Expiration Date ──
    const expirationDateRaw = field(fieldMap, "Expiration Date");
    const validUntil = expirationDateRaw ? formatExpirationDate(expirationDateRaw) : "";

    // ── Inspection Report sheet ──
    const inspectionItems = await parseInspectionSheet(workbook, imageLookup, errors);

    // ── Breakdown items ──
    const breakdownItems = extractBreakdownItems(dualMap);

    // ── Global monthly & payment ──
    const globalMonthly = field(fieldMap, "Summary Monthly Payment");
    const paidAmountRaw = field(fieldMap, "Paid Amount");
    const nextPaymentRaw = field(fieldMap, "Next Payment");
    const nextPaymentTitle = field(fieldMap, "Next Payment Title");

    // ── Disclaimers ──
    const summaryDisclaimers = collectNumberedFields(fieldMap, "Summary Disclaimer", 5);
    const paymentDisclaimers = collectNumberedFields(fieldMap, "Payment Disclaimer", 5);

    // ── Extra Services (up to 3 in standard template) ──
    const extraServices: ExtraService[] = [];
    for (let i = 1; i <= 3; i++) {
      const name = field(fieldMap, `Extra Service ${i}`);
      if (!name) continue;
      const description = field(fieldMap, `Extra Service ${i} Description`);
      const cta = field(fieldMap, `Extra Service ${i} CTA`);
      const imageRef = field(fieldMap, `Extra Service ${i} Image`);
      const image = await resolveOneImage(imageRef, imageLookup, errors);
      extraServices.push({ name, description, cta, image });
    }

    // ── Detect how many options are defined in Excel ──
    const maxOptionIndex = detectMaxOptionIndex(fieldMap, workbook);

    // ── Parse Option Product sheets ──
    const productSheetData = new Map<number, { items: SummaryLineItem[]; total: number }>();

    for (const sheetName of workbook.SheetNames) {
      const optionIndex = parseOptionIndex(sheetName);
      if (!optionIndex) continue;

      const rows = getSheetRows(workbook, sheetName);
      const [headerRow, ...dataRows] = rows;
      const headers = (headerRow ?? []).map(asText);
      console.log(`[importProposalZip] Sheet "${sheetName}" headers:`, headers);
      console.log(`[importProposalZip] Sheet "${sheetName}" data rows: ${dataRows.length}`);

      const items: SummaryLineItem[] = [];
      for (let rowIndex = 0; rowIndex < dataRows.length; rowIndex += 1) {
        const row = dataRows[rowIndex];
        const record: Record<string, string> = {};
        headers.forEach((header, index) => {
          record[header] = asText(row[index]);
        });
        if (!record["Product Name"]) continue;

        const imageRefs = extractImageRefs(record["Image "] ?? record["Image"]);
        const productImages = await resolveImageUrls(imageRefs, imageLookup, errors);
        const price = asNumber(record["Price"]);
        // Category is the primary section grouping; Product Group is the fallback
        const category = record["Category"] || record["Product Group"] || "";
        // "Optional" column marks add-on items (accepts: yes/1/true, case-insensitive)
        const optionalVal = normalize(record["Optional"] ?? "");
        const isAddon = optionalVal === "yes" || optionalVal === "1" || optionalVal === "true";
        const qty = record["Quantity "] ?? record["Quantity"] ?? "";
        const item: ODAItem = {
          id: `option-${optionIndex}-${rowIndex + 1}`,
          name: record["Product Name"],
          spec: record["Description (Optional)"] || "",
          price,
          quantity: qty,
          unit: record["Unit"] ?? "",
          previewImage: productImages[0],
          productImages,
          isAddon,
        };
        items.push({
          name: record["Product Name"],
          qty,
          unit: record["Unit"] || "",
          price,
          thumbnailSrc: productImages[0],
          description: record["Description (Optional)"],
          showChange: false,
          odaItem: item,
          sectionName: category,
        });
      }
      const total = items.reduce((sum, item) => sum + item.price, 0);
      productSheetData.set(optionIndex, { items, total });
    }

    // ── Build options purely from Excel ──
    const options: ODAOption[] = [];
    let globalDrawingImage: string | undefined = inspectionDrawing;

    for (let optIdx = 1; optIdx <= maxOptionIndex; optIdx++) {
      const title = field(fieldMap, `Option ${optIdx} Title`);
      const subtitle = field(fieldMap, `Option ${optIdx} Sub Title`);
      const featuringRaw = field(fieldMap, `Option ${optIdx} Featuring`) || field(fieldMap, `Option ${optIdx} Featuring `);
      const completionTime = field(fieldMap, `Option ${optIdx} Completion Time`);
      const coverImageRef = field(fieldMap, `Option ${optIdx} Cover Image`);
      const drawingRef = field(fieldMap, `Option ${optIdx} Drawing`);
      const contractPdfRef = field(fieldMap, `Option ${optIdx} Contract PDF`);

      const coverImage = await resolveOneImage(coverImageRef, imageLookup, errors);
      const drawingImage = await resolveOneImage(drawingRef, imageLookup, errors);
      const contractPageRefs = extractImageRefs(contractPdfRef);
      const contractPages = await resolveImageUrls(contractPageRefs, fileLookup, errors);

      // Use first option's drawing as global drawing fallback when no inspection drawing
      if (drawingImage && optIdx === 1 && !globalDrawingImage) {
        globalDrawingImage = drawingImage;
      }

      const sheetData = productSheetData.get(optIdx);
      const items = sheetData?.items ?? [];
      const total = sheetData?.total ?? 0;
      const scopeGroups = groupByCategory(items);
      const sections = buildSections(scopeGroups);
      const contractTotal = formatCurrency(total);

      const materials = featuringRaw ? featuringRaw.split("/").map((s) => s.trim()).filter(Boolean) : [];
      let deliveryDays = 0;
      if (completionTime) {
        const daysMatch = completionTime.match(/(\d+)\s*Days/i);
        if (daysMatch) deliveryDays = parseInt(daysMatch[1], 10);
      }

      const monthlyStr = globalMonthly
        ? (globalMonthly.includes("/") ? globalMonthly : `${globalMonthly} / mo`)
        : "";

      const paidAmount = paidAmountRaw || "";
      const nextPaymentAmount = nextPaymentRaw || "";
      const totalAmount = contractTotal;
      const paidNum = asNumber(paidAmount);
      const progressPercent = total > 0 ? Math.min(Math.round((paidNum / total) * 100), 100) : 0;

      const images = coverImage ? [coverImage] : [];

      const summary: ProposalOptionSummary = {
        title,
        description: subtitle,
        duration: completionTime || "",
        price: total > 0 ? `${contractTotal} USD` : "",
        contractTotal,
        monthly: monthlyStr,
        image: coverImage ?? "",
      };

      const option: ODAOption = {
        id: optIdx,
        title,
        subtitle,
        materials,
        deliveryDays,
        priceFrom: total,
        monthlyPayment: parseMonthlyAmount(globalMonthly),
        images,
        sections,
        scopeGroups,
        contractPages,
        drawing: drawingImage,
        summary,
        detailSummary: {
          title: title ? `SUMMARY - ${title}` : "",
          subtitle: projectName,
          contractTotal,
          monthlyPayment: monthlyStr,
          breakdown: breakdownItems,
        },
        approvedSummary: {
          title: displayTitle && projectName ? `${displayTitle} - ${projectName}` : "",
          approvedOn: "",
          paymentProgressLabel: "",
          paidAmount,
          totalAmount,
          progressPercent,
          nextPaymentLabel: "",
          nextPaymentAmount,
          nextPaymentDescription: nextPaymentTitle || "",
        },
      };

      options.push(option);
    }

    // ── Assemble final data — no defaultProposalV3Data, all from Excel ──
    const data: ProposalV3Data = {
      project: {
        contractorName,
        contractorAddress: field(fieldMap, "Contractor Address"),
        contractorUrl,
        contractorPhone: field(fieldMap, "Contractor Phone"),
        contractorEmail,
        contractorLicense: field(fieldMap, "Contractor License"),
        contractorStars,
        contractorLogo,
        contractorLogoHeader,
        contractorLogoProductFallback,
        contractorReviews,
        testimonialQuotes,
        projectName,
        projectAddress: "",
        salesName: field(fieldMap, "Sales Name"),
        salesTitle: field(fieldMap, "Sales Tile") || field(fieldMap, "Sales Title"),
        salesPhone: field(fieldMap, "Sales Phone"),
        salesEmail: field(fieldMap, "Sales Email"),
        clientName: field(fieldMap, "Client Name"),
        displayTitle,
        proposalName,
        proposalSlogan,
        proposalCover,
        emailImage: emailCover ?? contractorLogo ?? "",
        heroImage: "",
        themeColor: field(fieldMap, "Contractor Theme Color Override") || "#000000",
      },
      email: {
        fromLabel: `${contractorName} <${contractorEmail}>`,
        subject: `Your project proposal from ${contractorName}`,
        proposalLabel: proposalName,
        preparedByLabel: "Prepared by",
        footerNotice: "This email was sent to you because a proposal was created for your project.",
      },
      landing: {
        heroEyebrow: proposalSlogan,
        primaryButtonLabel: "INSPECTION REPORT",
        secondaryButtonLabel: "EXPLORE OPTIONS",
        validUntil,
        stickyPrimaryButtonLabel: "Contact Sales",
        stickySecondaryButtonLabel: "Explore Options",
        inspectionSectionTitle: "INSPECTION REPORT",
        stickyTitle: projectName,
        stickyAddress: "",
        preparedForPrefix: "Prepared for",
        inspectionDrawing: globalDrawingImage ?? "",
        inspectionItems,
        floorPlanMarkers: generateFloorPlanMarkers(inspectionItems.length),
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
        constructionTimeLabel: "Estimated Time Under Construction",
      },
      detailPage: {
        reviewsCompanyName: contractorName,
        reviewsScore: contractorStars,
        reviewsCount: contractorReviews,
        reviewsUrl: contractorUrl,
        reviews: [],
        reviewsReadMoreLabel: "Read more",
        primaryActionLabel: "Sign & Approve",
        secondaryActionLabel: "Explore Payment & Financing",
        contactSalesLabel: "Contact Sales",
        downloadLabel: "Download Config [PDF]",
        inspectionReportLabel: "Inspection Report",
        breakdownFootnotes: summaryDisclaimers,
        changeOptionLabel: "Change Option",
        productsTitle: "All Included/Selected Products",
        drawingsTitle: "Drawings",
        contractTotalLabel: "Contract Total",
        monthlyPaymentLabel: "Estimated Monthly Payment",
      },
      approvedPage: {
        tabs: ["Project Home", "Contract", "Documents", "Products", "Drawings", "Invoices & Payments"],
        primaryActionLabel: "Make A Payment",
        secondaryActionLabel: "Financing Service",
        contactSalesLabel: "Contact Sales",
        downloadLabel: "Download Contract [PDF]",
        recordsLabel: "Payment Schedule & Records",
        footnotes: paymentDisclaimers,
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
      extraServices,
      contractPages: [],
      drawings: {
        detail: globalDrawingImage ?? "",
        approved: globalDrawingImage ?? "",
      },
      upsell: {
        warrantyImage: "",
      },
      options,
    };

    if (errors.length > 0) {
      console.warn("[importProposalZip] Non-fatal errors:", errors);
    }

    console.log("[importProposalZip] Import complete. Options:", data.options.map((o, i) => ({
      index: i,
      title: o.title,
      subtitle: o.subtitle,
      priceFrom: o.priceFrom,
      summaryTitle: o.summary.title,
      summaryImage: o.summary.image ? "✓" : "✗",
      sectionsCount: o.sections.length,
      scopeGroupsCount: o.scopeGroups.length,
      materials: o.materials,
    })));

    return data;
  } catch (err) {
    console.error("[importProposalZip] Import failed:", err);
    if (err instanceof Error) {
      console.error("[importProposalZip] Message:", err.message);
      console.error("[importProposalZip] Stack:", err.stack);
    }
    throw err;
  }
}

/** Spread N markers across the floor plan image at pre-defined positions */
function generateFloorPlanMarkers(count: number) {
  const positions = [
    { x: "18%", y: "22%" }, { x: "55%", y: "14%" }, { x: "80%", y: "30%" },
    { x: "28%", y: "52%" }, { x: "65%", y: "45%" }, { x: "42%", y: "72%" },
    { x: "15%", y: "78%" }, { x: "75%", y: "68%" }, { x: "50%", y: "85%" },
    { x: "88%", y: "55%" }, { x: "33%", y: "35%" }, { x: "70%", y: "88%" },
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    x: positions[i % positions.length].x,
    y: positions[i % positions.length].y,
  }));
}

/** Detect the max option index defined in Proposal Data or product sheets */
function detectMaxOptionIndex(fieldMap: Map<string, string>, workbook: XLSX.WorkBook): number {
  let max = 0;
  // Check "Option N Title" keys in fieldMap
  for (let i = 1; i <= 20; i++) {
    if (fieldMap.get(`Option ${i} Title`)) max = i;
  }
  // Check "Option N Products" sheets
  for (const sheetName of workbook.SheetNames) {
    const idx = parseOptionIndex(sheetName);
    if (idx && idx > max) max = idx;
  }
  return max;
}
