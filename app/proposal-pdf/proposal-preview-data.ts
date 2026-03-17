import proposalDataJson from './proposal-data.json';

export type WidgetVars = Record<string, string | number | boolean | string[] | null | undefined>;

type ProposalCategory = {
  category_name: string;
  products: Array<{
    product_name: string;
  }>;
};

type PaymentPhase = {
  purpose: string;
  amount: string;
  percentage: number;
};

const proposal = proposalDataJson.data;
const option = proposal.options[0];
const categories = (option?.products ?? []) as ProposalCategory[];
const paymentPhases = (option?.payment_strategy?.phases ?? []) as PaymentPhase[];

function formatCurrency(value: string | number | null | undefined) {
  const amount = typeof value === 'number' ? value : Number(value ?? 0);
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value: string | null | undefined) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function formatPhone(value: string | null | undefined) {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('0')) {
    return `${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`;
  }
  return value;
}

function escapeHtml(value: string | null | undefined) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getString(vars: WidgetVars | null, key: string, fallback: string) {
  const value = vars?.[key];
  return typeof value === 'string' ? value : fallback;
}

function getNumber(vars: WidgetVars | null, key: string, fallback: number) {
  const value = vars?.[key];
  return typeof value === 'number' ? value : fallback;
}

function getBoolean(vars: WidgetVars | null, key: string, fallback: boolean) {
  const value = vars?.[key];
  return typeof value === 'boolean' ? value : fallback;
}

function toAddressLine(projectName: string | null | undefined) {
  if (!projectName) return '';
  const parts = projectName.split(' - ');
  const lastSegment = parts[parts.length - 1] ?? projectName;
  return lastSegment.replace(/\s*\n\s*/g, ', ').trim();
}

const nonInstallationCategories = categories.filter((category) => category.category_name !== 'Installation Fee');
const installationCategory = categories.find((category) => category.category_name === 'Installation Fee');

const productRows = nonInstallationCategories.map((category) => ({
  title: category.category_name,
  description:
    category.products.length > 3
      ? `${category.products.slice(0, 3).map((product) => product.product_name).join(', ')} +${category.products.length - 3} more`
      : category.products.map((product) => product.product_name).join(', '),
  quantity: `${category.products.length} item${category.products.length > 1 ? 's' : ''}`,
  amount: 'Included',
}));

const paymentSummary =
  paymentPhases.length > 0
    ? paymentPhases.map((phase) => ({
        label: `${phase.purpose[0].toUpperCase()}${phase.purpose.slice(1)} (${Math.round(phase.percentage * 100)}%)`,
        value: formatCurrency(phase.amount),
      }))
    : [];

export const proposalPreviewData = {
  company: {
    name: 'Queensland Fencing Specialists',
    website: 'www.fencingspecialists.au',
    email: proposal.sales_email || 'info@fencingspecialists.au',
    phone: formatPhone(proposal.sales_phone) || '',
    addressLine1: proposal.project?.name?.split('\n')[0] ?? '',
    addressLine2: toAddressLine(proposal.project?.name),
    extra: 'QFS PTY LTD (QBCC: 15281810)',
    logo:
      'https://cdn-files-1.arcsite.com/288230925907964007/288230925908033148/20e3b001-f4a4-4c05-b0de-a142878e4c48_Queensland-2BFencing-2BSpecialists-2Blogo.png?Expires=1773843195&Signature=xZd3RRR390~h-VCg4LdtdWD~Xmtfx7rZR39JvhqPix3hbU5TPF5XoQ8sBGy0~dsoXqO-8Mdqy3X89KnGG2Pl-MWa2yQeCPqKh4r8vxeCF7ivGbapaBo4qYvt05TZHiw4mzA0ufq6qRBj0CslMSkOhD4erzs0zKqF7FiDtw2d4In5eukRE1h7jTmO-EbhftBHVRG8FbUpwGJ1p2hiR4MUlC1aSGzRL5YrBGMk8fvUPieBL9jE-6CU~4DmoYb4rDdPReu0upHSSt6NsrVPVxdtAfx9B8SvBNOscvXNbKyKKKRa03Tk5vvQkBvsduA16o--Eyv5QqtwJLDKPTan6XkHtA__&Key-Pair-Id=APKAIZL6W5TJO2AK7DOQ',
  },
  client: {
    date: formatDate(proposal.create_time),
    jobNumber: proposal.document_number || proposal.id,
    siteAddress: toAddressLine(proposal.project?.name),
    name: proposal.customer_name,
    phones: '',
    emails: proposal.customer_email,
    addressLine1: toAddressLine(proposal.project?.name).split(', ')[0] ?? '',
    addressLine2: toAddressLine(proposal.project?.name).split(', ').slice(1).join(', '),
  },
  sales: {
    name: proposal.sales_name,
    phone: formatPhone(proposal.sales_phone),
    email: proposal.sales_email,
  },
  informationFields: [
    {
      label: 'Proposal',
      value: proposal.name,
      block: true,
    },
    {
      label: 'Project',
      value: proposal.project?.name?.replace(/\n/g, ' ') ?? '',
      block: true,
    },
    {
      label: 'Status',
      value: proposal.status,
      alignedRight: true,
    },
    {
      label: 'Option',
      value: option?.name ?? '',
      block: true,
    },
    {
      label: 'Expires',
      value: formatDate(proposal.expired_time),
      alignedRight: true,
    },
  ],
  productRows,
  installationItems: installationCategory?.products.map((product) => product.product_name) ?? [],
  summary: {
    subtotal: formatCurrency(option?.total ?? proposal.total),
    discount: paymentSummary[0]?.value ?? '-',
    tax: paymentSummary[1]?.value ?? '-',
    total: formatCurrency(proposal.total),
  },
  detailPlanImages: [
    '/proposal-pdf/detail-plan/plan-1.png',
    '/proposal-pdf/detail-plan/plan-2.png',
    '/proposal-pdf/detail-plan/plan-3.png',
  ],
  drawingImage: option?.pdf_cover_png_url ?? '',
  locationPhoto: option?.pdf_cover_png_url ?? '',
  paymentSummary,
  raw: {
    proposal,
    option,
    categories,
  },
};

export function getRawWidgetHtml(widgetName: string, vars: WidgetVars | null) {
  const data = proposalPreviewData;

  switch (widgetName) {
    case 'logo_on_right':
      return `
<table id="logo_on_right" class="mb16">
  <tr>
    <td colspan="2">
      ${getBoolean(vars, 'hide_org_name', false) ? '' : `<p style="font-size: ${getNumber(vars, 'org_name_font_size', 12)}pt">${escapeHtml(data.company.name)}</p>`}
      ${getBoolean(vars, 'display_link', true) ? `<p><a href="https://${escapeHtml(data.company.website)}" rel="noopener">${escapeHtml(data.company.website)}</a></p>` : ''}
      <p><a href="mailto:${escapeHtml(data.company.email)}">${escapeHtml(data.company.email)}</a></p>
      <p><a style="color: blue; text-decoration:underline;" href="tel:${escapeHtml(data.company.phone)}" target="_blank">${escapeHtml(data.company.phone)}</a></p>
      <p>${escapeHtml(data.company.addressLine1)}</p>
      <p>${escapeHtml(data.company.addressLine2)}</p>
      <p>${escapeHtml(getString(vars, 'additonal_text_under_address', data.company.extra))}</p>
    </td>
    <td class="text-right" colspan="2">
      <img src="${escapeHtml(data.company.logo)}" alt="" width="${getNumber(vars, 'logo_width', 150)}pt" />
    </td>
  </tr>
</table>`;

    case 'client_profile':
      return `
<div id="client_profile" class="mb16">
  <table class="mb16">
    <tr>
      <td class="header" style="width: ${getNumber(vars, 'date_title_width', 20)}%;">Date</td>
      <td style="width: ${getNumber(vars, 'date_value_width', 30)}%; vertical-align: center"><p>${escapeHtml(data.client.date)}</p></td>
      <td style="width: ${getNumber(vars, 'job_number_title_width', 20)}%;"><p class="header">${escapeHtml(getString(vars, 'title_job_number', 'Job Number'))}</p></td>
      <td style="width: ${getNumber(vars, 'job_number_value_width', 30)}%; vertical-align: center"><p>${escapeHtml(data.client.jobNumber)}</p></td>
    </tr>
  </table>
  <table class="mb16">
    <tr>
      <td class="header" style="width: ${getNumber(vars, 'title_site_width', 20)}%;">${escapeHtml(getString(vars, 'title_site_address', 'Site Address'))}</td>
      <td style="width: 80%; vertical-align: center"><p>${escapeHtml(data.client.siteAddress)}</p></td>
    </tr>
  </table>
  <table>
    <tr style="vertical-align: top;">
      <td>
        <p class="header">${escapeHtml(getString(vars, 'title_client_detail', 'Client Details'))}</p>
        <p>${escapeHtml(data.client.name)}</p>
        ${data.client.emails ? `<p><a style="color: blue; text-decoration:underline;" href="mailto:${escapeHtml(data.client.emails)}">${escapeHtml(data.client.emails)}</a></p>` : ''}
        <p>${escapeHtml(data.client.addressLine1)}</p>
        <p>${escapeHtml(data.client.addressLine2)}</p>
      </td>
      ${
        getBoolean(vars, 'hide_sales_detail', false)
          ? ''
          : `<td style="vertical-align: left">
              <p class="header">${escapeHtml(getString(vars, 'title_sales_detail', 'Sales Representative'))}</p>
              <p>${escapeHtml(data.sales.name)}</p>
              <p><a style="color: blue; text-decoration:underline;" href="tel:${escapeHtml(data.sales.phone)}">${escapeHtml(data.sales.phone)}</a></p>
              <p><a style="color: blue; text-decoration:underline;" href="mailto:${escapeHtml(data.sales.email)}">${escapeHtml(data.sales.email)}</a></p>
            </td>`
      }
    </tr>
  </table>
</div>`;

    case 'additional_information':
      return `
<table class="mt16">
  <tr><td><p class="header">${escapeHtml(getString(vars, 'title_additional_information', 'Information'))}</p></td></tr>
</table>
<div id="additional_data" class="mb16">
  <table class="field-data-table mb16" style="margin-top: 6pt;">
    ${data.informationFields
      .map(
        (field) => `<tr>
          <td>
            <p class="body">${escapeHtml(field.label)}</p>
            <div class="body2" style="padding: 2pt 20pt;">${escapeHtml(field.value)}</div>
          </td>
        </tr>`,
      )
      .join('')}
  </table>
</div>`;

    case 'product_list':
      return `
<div id="product-list" class="mb16">
  ${getBoolean(vars, 'hide_product_list_header', false) ? '' : `<div class="header">${escapeHtml(getString(vars, 'title_included_product_list', 'Product List'))}</div>`}
  <table style="border-top: 6pt solid #ebebeb; width: 100%;">
    <tbody>
      <tr style="border-bottom: 1pt solid #dbdbdb" class="header">
        <td class="text-left" style="padding: 5pt 3pt; width: ${getNumber(vars, 'product_name_width', 50)}%">Description</td>
        <td class="text-left" style="padding: 5pt 3pt; width: ${getNumber(vars, 'product_quantity_width', 15)}%">Quantity</td>
        <td class="text-right" style="padding: 5pt 3pt; width: ${getNumber(vars, 'product_amount_width', 35)}%">Amount</td>
      </tr>
    </tbody>
  </table>
  ${data.productRows
    .map(
      (row) => `<table>
        <tr style="border-bottom: 1px solid #DBDBDB;">
          <td class="text-left" style="width: ${getNumber(vars, 'product_name_width', 50)}%; vertical-align: center; padding: 3pt">
            <p class="body-strong" style="margin-bottom: 0; padding-bottom: 0;">${escapeHtml(row.title)}</p>
            <p class="body3" style="margin: 0;">${escapeHtml(row.description)}</p>
          </td>
          <td class="text_left" style="width: ${getNumber(vars, 'product_quantity_width', 15)}%; padding: 3pt">${escapeHtml(row.quantity)}</td>
          <td class="text-right" style="vertical-align: top; width: ${getNumber(vars, 'product_amount_width', 35)}%; padding: 3pt">
            <p class="body-strong text-right">${escapeHtml(row.amount)}</p>
          </td>
        </tr>
      </table>`,
    )
    .join('')}
</div>`;

    case 'group_by_category_only_name':
      return `
<div id="product-list" class="mb16">
  ${getBoolean(vars, 'hide_product_list_header', true) ? '' : `<table style="margin-bottom: 8pt;"><tr><td><p class="header">${escapeHtml(getString(vars, 'title_included_product_list', 'Installation'))}</p></td></tr></table>`}
  <div class="bg-gray text-md" style="padding: 3pt;">${escapeHtml(getString(vars, 'custom_price_items_title', 'Other Items'))}</div>
  <table>
    ${data.installationItems
      .map(
        (item) => `<tr><td class="text-sm font-bold" style="text-align: left; width: 70%; padding-left: 3pt">${escapeHtml(item)}</td></tr>`,
      )
      .join('')}
  </table>
  <table class="divider-top" style="margin-bottom: 5pt; margin-top: 5pt;">
    <tr>
      <td class="text-left" style="width: 50%"></td>
      <td class="text-left" style="width: 15%">Subtotal</td>
      <td class="text-right" style="width: 35%">${escapeHtml(data.summary.total)}</td>
    </tr>
  </table>
</div>`;

    case 'group_by_category_only_name_and_quantity':
      return `
<div id="product-list" class="mb16">
  ${getBoolean(vars, 'hide_product_list_header', false) ? '' : `<table style="margin-bottom: 8pt;"><tr><td><p class="header">${escapeHtml(getString(vars, 'title_included_product_list', 'Total'))}</p></td></tr></table>`}
  <div class="bg-gray text-md" style="padding: 3pt;">${escapeHtml(getString(vars, 'custom_price_items_title', 'Other Items'))}</div>
  <table>
    ${data.productRows
      .slice(0, 4)
      .map(
        (row) => `<tr>
          <td class="text-sm font-bold" style="text-align: left; width: 70%; padding-left: 3pt">${escapeHtml(row.title)}</td>
          <td style="text-align: right; width: 30%">${escapeHtml(row.quantity)}</td>
        </tr>
        <tr>
          <td class="text-gray" style="padding-left: 3pt">${escapeHtml(row.description)}</td>
        </tr>`,
      )
      .join('')}
  </table>
  <table class="mb48" style="border-top: 1px solid #434343; margin-top: 10px;">
    <tr>
      <td style="width: 50%;"></td>
      <td style="width: 15%;"><p>Subtotal</p></td>
      <td style="width: 35%;"><p class="body text-right">${escapeHtml(data.summary.subtotal)}</p></td>
    </tr>
    ${data.paymentSummary
      .map(
        (payment) => `<tr>
          <td style="width: 50%;"></td>
          <td style="width: 25%;"><p>${escapeHtml(payment.label)}</p></td>
          <td style="width: 25%;"><p class="body text-right">${escapeHtml(payment.value)}</p></td>
        </tr>`,
      )
      .join('')}
    <tr>
      <td style="width: 50%;"></td>
      <td style="width: 15%;"><p class="body-strong">${escapeHtml(getString(vars, 'total_label', 'Total'))}</p></td>
      <td style="width: 35%;"><p class="body-strong text-right">${escapeHtml(data.summary.total)}</p></td>
    </tr>
  </table>
</div>`;

    case 'drawing':
      return `
<div id="drawing" style="margin-top: 10pt;" class="mb16">
  ${getBoolean(vars, 'hide_detail_plan_title', false) ? '' : `<div class="header mb16">${escapeHtml(getString(vars, 'title_detail_plan', 'Detail Plan'))}</div>`}
  <div style="background-color: white; padding: 10pt 0; overflow: hidden;">
    <table style="width: 100%;">
      <tr>
        ${data.detailPlanImages
          .map(
            (image) => `<td style="width: 33.33%; padding: 0 6pt; vertical-align: top;">
              <img style="display: block; width: 100%; height: 180pt; object-fit: contain; background: #f6f6f6; border: 1pt solid #ececec;" src="${escapeHtml(image)}" />
            </td>`,
          )
          .join('')}
      </tr>
    </table>
  </div>
</div>`;

    case 'location_photo_new': {
      const rows = getNumber(vars, 'row_count_per_page', 3);
      const columns = getNumber(vars, 'col_count_per_page', 3);
      const cells = Array.from({ length: rows * columns }, (_, index) => index + 1).slice(0, 6);
      return `
<div id="location_based_photos">
  <table>
    ${Array.from({ length: Math.ceil(cells.length / columns) }, (_, rowIndex) => {
      const rowItems = cells.slice(rowIndex * columns, rowIndex * columns + columns);
      return `<tr style="height: 217pt;">
        ${rowItems
          .map(
            (cell) => `<td style="max-height: 217pt; max-width: 170pt; background-color: #f5f5f5; text-align: center; border: 5pt solid #fff">
              <img style="display: inline-block; margin-top: 5pt; width: 155pt; height: 187pt; object-fit: contain; background-color: #eaeaea" src="${escapeHtml(data.locationPhoto)}">
              <p style="height: 14pt; line-height: 10pt;">${Math.ceil(cell / columns)} - ${((cell - 1) % columns) + 1}</p>
            </td>`,
          )
          .join('')}
      </tr>`;
    }).join('')}
  </table>
</div>`;
    }

    case 'customer_only_signature':
      return `
<div id="signature" style="margin-top: ${getNumber(vars, 'signature_margin_top', 50)}pt">
  <table>
    <tr style="height: 5px;">
      <td style="width: 150pt; color: white; vertical-align: bottom;"></td>
      <td style="width: 25pt"></td>
      <td style="width: 50pt; vertical-align: bottom;"></td>
      <td style="width: 50pt;"></td>
      <td style="width: 150pt; color: white; vertical-align: bottom;"></td>
      <td style="width: 25pt;"></td>
      <td style="width: 50pt; vertical-align: bottom;"></td>
    </tr>
    <tr style="height: 5px;">
      <td style="width: 150pt; border-top: 1px solid #000"><p class="body text-center">${escapeHtml(getString(vars, 'signature_customer_title', 'Customer Signature'))}</p></td>
      <td style="width: 25pt"></td>
      <td style="width: 50pt; border-top: 1px solid #000"><p class="body text-center">Date</p></td>
      <td style="width: 50pt"></td>
      <td style="width: 150pt;"></td>
      <td style="width: 25pt"></td>
      <td style="width: 50pt;"></td>
    </tr>
  </table>
</div>`;

    default:
      return '';
  }
}
