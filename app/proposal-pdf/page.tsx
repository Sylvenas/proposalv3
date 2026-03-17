import proposalTemplate from './data.json';
import { proposalPreviewData, type WidgetVars } from './proposal-preview-data';

type IncludeWidgetFragment = {
  fragment_type: 'INCLUDE_WIDGET';
  widget_name: string;
  widget_vars_value: WidgetVars | null;
  render_html: string;
};

type EmbedContentFragment = {
  fragment_type: 'EMBED_CONTENT';
  display_name: string;
  html_content: string;
};

type PageBreakFragment = {
  fragment_type: 'PAGE_BREAK_SETTINGS';
};

type TemplateConfigFragment = {
  fragment_type: 'TEMPLATE_CONFIG';
  template_config: {
    page_configs: Array<{
      name: string;
      width: number;
      height: number;
      content_frame: {
        top_margin: number;
        right_margin: number;
        bottom_margin: number;
        left_margin: number;
      };
    }>;
    page_number: {
      left_margin: number;
      bottom_margin: number;
      font_size: number;
      hide_page_number: boolean;
    };
  };
};

type Fragment = IncludeWidgetFragment | EmbedContentFragment | PageBreakFragment | TemplateConfigFragment;

const fragments = proposalTemplate.data.template_object.fragments as Fragment[];
const templateConfig = fragments.find(
  (fragment): fragment is TemplateConfigFragment => fragment.fragment_type === 'TEMPLATE_CONFIG',
)?.template_config;

const defaultPageConfig = templateConfig?.page_configs[0];
const pageWidth = defaultPageConfig?.width ?? 612;
const pageHeight = defaultPageConfig?.height ?? 792;
const contentFrame = defaultPageConfig?.content_frame ?? {
  top_margin: 50,
  right_margin: 50,
  bottom_margin: 50,
  left_margin: 50,
};
const pageNumber = templateConfig?.page_number ?? {
  left_margin: 50,
  bottom_margin: 10,
  font_size: 10,
  hide_page_number: false,
};

const sampleData = proposalPreviewData;

function getPages(allFragments: Fragment[]) {
  const pages: Fragment[][] = [];
  let currentPage: Fragment[] = [];

  for (const fragment of allFragments) {
    if (fragment.fragment_type === 'TEMPLATE_CONFIG') {
      continue;
    }

    if (fragment.fragment_type === 'PAGE_BREAK_SETTINGS') {
      if (currentPage.length > 0) {
        pages.push(currentPage);
        currentPage = [];
      }
      continue;
    }

    currentPage.push(fragment);
  }

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages;
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

function renderWidget(fragment: IncludeWidgetFragment) {
  const vars = fragment.widget_vars_value;

  switch (fragment.widget_name) {
    case 'logo_on_right':
      return (
        <section className="mb-6 border-b border-stone-200 pb-5">
          <div className="grid grid-cols-[1.5fr_0.9fr] items-start gap-8">
            <div className="space-y-1 text-[13px] leading-6 text-stone-700">
              {!getBoolean(vars, 'hide_org_name', false) && (
                <p
                  className="text-stone-950"
                  style={{ fontSize: `${getNumber(vars, 'org_name_font_size', 12)}pt` }}
                >
                  {sampleData.company.name}
                </p>
              )}
              {getBoolean(vars, 'display_link', true) && (
                <>
                  <a className="block text-[#7c4f22] underline underline-offset-2" href="https://www.qfspecialists.com.au">
                    {sampleData.company.website}
                  </a>
                  <a className="block text-[#7c4f22] underline underline-offset-2" href={`mailto:${sampleData.company.email}`}>
                    {sampleData.company.email}
                  </a>
                  <a className="block text-[#7c4f22] underline underline-offset-2" href={`tel:${sampleData.company.phone}`}>
                    {sampleData.company.phone}
                  </a>
                </>
              )}
              <p>{sampleData.company.addressLine1}</p>
              <p>{sampleData.company.addressLine2}</p>
              <p>{getString(vars, 'additonal_text_under_address', sampleData.company.extra)}</p>
            </div>
            <div className="flex justify-end">
              <img
                src={sampleData.company.logo}
                alt="QFS logo"
                className="h-auto object-contain"
                style={{ width: `${getNumber(vars, 'logo_width', 150)}pt` }}
              />
            </div>
          </div>
        </section>
      );

    case 'client_profile':
      return (
        <section className="mb-6 space-y-4 text-[12.5px] leading-6 text-stone-700">
          <table className="w-full border-collapse">
            <tbody>
              <tr className="align-top">
                <td className="pr-3 font-medium uppercase tracking-[0.16em] text-stone-500" style={{ width: `${getNumber(vars, 'date_title_width', 20)}%` }}>
                  Date
                </td>
                <td className="pr-6 text-stone-950" style={{ width: `${getNumber(vars, 'date_value_width', 30)}%` }}>
                  {sampleData.client.date}
                </td>
                {!getBoolean(vars, 'hide_empty_job_number', true) || sampleData.client.jobNumber ? (
                  <>
                    <td className="pr-3 font-medium uppercase tracking-[0.16em] text-stone-500" style={{ width: `${getNumber(vars, 'job_number_title_width', 20)}%` }}>
                      {getString(vars, 'title_job_number', 'Job Number')}
                    </td>
                    <td className="text-stone-950" style={{ width: `${getNumber(vars, 'job_number_value_width', 30)}%` }}>
                      {sampleData.client.jobNumber}
                    </td>
                  </>
                ) : null}
              </tr>
            </tbody>
          </table>

          <table className="w-full border-collapse">
            <tbody>
              <tr className="align-top">
                <td className="pr-3 font-medium uppercase tracking-[0.16em] text-stone-500" style={{ width: `${getNumber(vars, 'title_site_width', 20)}%` }}>
                  {getString(vars, 'title_site_address', 'Site Address')}
                </td>
                <td className="text-stone-950">{sampleData.client.siteAddress}</td>
              </tr>
            </tbody>
          </table>

          <div className="grid grid-cols-2 gap-8 border-t border-stone-200 pt-4">
            <div>
              <p className="mb-1 font-medium uppercase tracking-[0.16em] text-stone-500">
                {getString(vars, 'title_client_detail', 'Client Details')}
              </p>
              <p className="text-stone-950">{sampleData.client.name}</p>
              {!getBoolean(vars, 'hide_client_phone', false) && sampleData.client.phones && (
                <a className="block text-[#7c4f22] underline underline-offset-2" href={`tel:${sampleData.client.phones}`}>
                  {sampleData.client.phones}
                </a>
              )}
              {!getBoolean(vars, 'hide_client_email', false) && sampleData.client.emails && (
                <a className="block text-[#7c4f22] underline underline-offset-2" href={`mailto:${sampleData.client.emails}`}>
                  {sampleData.client.emails}
                </a>
              )}
              <p>{sampleData.client.addressLine1}</p>
              <p>{sampleData.client.addressLine2}</p>
            </div>

            {!getBoolean(vars, 'hide_sales_detail', false) && (
              <div className={getString(vars, 'sales_text_alignment', 'left') === 'right' ? 'text-right' : 'text-left'}>
                <p className="mb-1 font-medium uppercase tracking-[0.16em] text-stone-500">
                  {getString(vars, 'title_sales_detail', 'Sales Representative')}
                </p>
                <p className="text-stone-950">{sampleData.sales.name}</p>
                {sampleData.sales.phone && (
                  <a className="block text-[#7c4f22] underline underline-offset-2" href={`tel:${sampleData.sales.phone}`}>
                    {sampleData.sales.phone}
                  </a>
                )}
                {!getBoolean(vars, 'hide_sales_email', false) && sampleData.sales.email && (
                  <a
                    className="block text-[#7c4f22] underline underline-offset-2"
                    href={`mailto:${sampleData.sales.email}`}
                  >
                    {sampleData.sales.email}
                  </a>
                )}
              </div>
            )}
          </div>
        </section>
      );

    case 'additional_information':
      return (
        <section className="mb-6">
          <div className="mb-3 border-t-2 border-stone-900 pt-2">
            <p className="font-medium uppercase tracking-[0.18em] text-stone-700">
              {getString(vars, 'title_additional_information', 'Information')}
            </p>
          </div>
          <table className="w-full border-collapse text-[12.5px] leading-6">
            <tbody>
              {sampleData.informationFields.map((field) => (
                <tr key={field.label} className="border-b border-stone-100 align-top">
                  <td className="py-2 text-stone-600">{field.label}</td>
                  <td className={`py-2 text-stone-950 ${field.alignedRight ? 'text-right' : 'text-left'}`}>
                    {field.block ? <div className="max-w-[28rem]">{field.value}</div> : field.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      );

    case 'product_list':
      return (
        <section className="mb-6">
          {!getBoolean(vars, 'hide_product_list_header', false) && (
            <div className="mb-2 border-t-2 border-stone-900 pt-2">
              <p className="font-medium uppercase tracking-[0.18em] text-stone-700">
                {getString(vars, 'title_included_product_list', 'Product List')}
              </p>
            </div>
          )}
          <table className="w-full border-collapse text-[12px] leading-5">
            <thead>
              <tr className="border-y border-stone-300 text-left uppercase tracking-[0.14em] text-stone-500">
                <th className="py-2 pr-3 font-medium" style={{ width: `${getNumber(vars, 'product_name_width', 50)}%` }}>
                  Description
                </th>
                <th className="py-2 pr-3 font-medium" style={{ width: `${getNumber(vars, 'product_quantity_width', 15)}%` }}>
                  Quantity
                </th>
                <th className="py-2 font-medium text-right" style={{ width: `${getNumber(vars, 'product_amount_width', 35)}%` }}>
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {sampleData.productRows.map((row) => (
                <tr key={row.title} className="border-b border-stone-200 align-top">
                  <td className="py-3 pr-3">
                    <p className="font-medium text-stone-950">{row.title}</p>
                    {!getBoolean(vars, 'hide_product_desc', false) && <p className="text-stone-500">{row.description}</p>}
                  </td>
                  <td className="py-3 pr-3 text-stone-700">{row.quantity}</td>
                  <td className="py-3 text-right font-medium text-stone-950">{row.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      );

    case 'group_by_category_only_name':
      return (
        <section className="mb-6">
          {!getBoolean(vars, 'hide_product_list_header', true) && (
            <div className="mb-2 border-t-2 border-stone-900 pt-2">
              <p className="font-medium uppercase tracking-[0.18em] text-stone-700">
                {getString(vars, 'title_included_product_list', 'Installation')}
              </p>
            </div>
          )}
          <div className="bg-stone-100 px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-stone-600">
            {getString(vars, 'custom_price_items_title', 'Other Items')}
          </div>
          <div className="border-b border-stone-300 px-3 py-3 text-[12.5px] text-stone-800">
            {sampleData.installationItems.map((item) => (
              <p key={item} className="py-1">
                {item}
              </p>
            ))}
          </div>
          <div className="flex justify-end border-t border-stone-400 px-3 py-3 text-[12.5px]">
            <div className="grid grid-cols-[90px_120px] gap-3">
              <span className="text-stone-600">Subtotal</span>
              <span className="text-right font-medium text-stone-950">$20.00</span>
            </div>
          </div>
        </section>
      );

    case 'group_by_category_only_name_and_quantity':
      return (
        <section className="mb-6">
          {!getBoolean(vars, 'hide_product_list_header', false) && (
            <div className="mb-2 border-t-2 border-stone-900 pt-2">
              <p className="font-medium uppercase tracking-[0.18em] text-stone-700">
                {getString(vars, 'title_included_product_list', 'Total')}
              </p>
            </div>
          )}
          <div className="bg-stone-100 px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-stone-600">
            {getString(vars, 'custom_price_items_title', 'Other Items')}
          </div>
          <div className="border-b border-stone-300 px-3 py-3">
            <div className="flex items-start justify-between gap-3 text-[12.5px]">
              <div>
                <p className="font-medium text-stone-950">Custom Product</p>
                <p className="text-stone-500">Other Item</p>
              </div>
              {getBoolean(vars, 'show_custom_item_price', true) && (
                <p className="font-medium text-stone-950">$20.00</p>
              )}
            </div>
            <div className="mt-4 flex justify-end border-t border-stone-400 pt-3 text-[12.5px]">
              <div className="grid grid-cols-[90px_120px] gap-3">
                <span className="text-stone-600">Subtotal</span>
                <span className="text-right font-medium text-stone-950">$20.00</span>
              </div>
            </div>
          </div>

          <div className="ml-auto mt-6 w-[270px] border-t border-stone-700 pt-3 text-[12.5px]">
            <div className="grid grid-cols-[1fr_auto] gap-y-2 text-stone-700">
              <span>Subtotal</span>
              <span>{sampleData.summary.subtotal}</span>
              {sampleData.paymentSummary.map((payment) => (
                <div key={payment.label} className="contents">
                  <span>{payment.label}</span>
                  <span>{payment.value}</span>
                </div>
              ))}
            </div>
            {!getBoolean(vars, 'hide_total_price', false) && (
              <div className="mt-3 grid grid-cols-[1fr_auto] border-t border-stone-300 pt-3 text-[14px] font-semibold text-stone-950">
                <span>{getString(vars, 'total_label', 'Total')}</span>
                <span>{sampleData.summary.total}</span>
              </div>
            )}
          </div>
        </section>
      );

    case 'drawing':
      return (
        <section className="mb-6">
          {!getBoolean(vars, 'hide_detail_plan_title', false) && (
            <div className="mb-3 border-t-2 border-stone-900 pt-2">
              <p className="font-medium uppercase tracking-[0.18em] text-stone-700">
                {getString(vars, 'title_detail_plan', 'Detail Plan')}
              </p>
            </div>
          )}
          <div
            className="overflow-hidden border border-stone-200 bg-white p-3"
            style={{ minHeight: `${getNumber(vars, 'drawing_height_ratio', 82) * 4.2}px` }}
          >
            <div className="grid grid-cols-3 gap-3">
              {sampleData.detailPlanImages.map((image, imageIndex) => (
                <div key={`${image}-${imageIndex}`} className="overflow-hidden rounded-sm border border-stone-200 bg-stone-50">
                  <img src={image} alt={`Detail plan ${imageIndex + 1}`} className="h-[240px] w-full object-contain" />
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case 'location_photo_new': {
      const rows = getNumber(vars, 'row_count_per_page', 3);
      const columns = getNumber(vars, 'col_count_per_page', 3);
      const cells = Array.from({ length: rows * columns }, (_, index) => index + 1).slice(0, 6);

      return (
        <section className="mb-6">
          <div className="grid grid-cols-3 gap-3">
            {cells.map((cell) => (
              <div key={cell} className="border border-stone-200 bg-stone-50 p-2">
                <img src={sampleData.locationPhoto} alt={`Location ${cell}`} className="h-[132px] w-full object-contain bg-stone-100" />
                <p className="pt-2 text-center text-[10px] tracking-[0.16em] text-stone-500">
                  {Math.ceil(cell / columns)} - {((cell - 1) % columns) + 1}
                </p>
              </div>
            ))}
          </div>
        </section>
      );
    }

    case 'customer_only_signature':
      return (
        <section className="pt-6" style={{ marginTop: `${getNumber(vars, 'signature_margin_top', 50) / 2}px` }}>
          <div className="grid grid-cols-[1.2fr_0.45fr_1.2fr_0.45fr] gap-6 text-[12px] text-stone-700">
            <div>
              <div className="h-10 border-b border-stone-900" />
              <p className="pt-2 text-center">{getString(vars, 'signature_customer_title', 'Customer Signature')}</p>
            </div>
            <div>
              <div className="h-10 border-b border-stone-900" />
              <p className="pt-2 text-center">Date</p>
            </div>
            <div>
              <div className="h-10 border-b border-stone-200" />
            </div>
            <div>
              <div className="h-10 border-b border-stone-200" />
            </div>
          </div>
        </section>
      );

    default:
      return null;
  }
}

function renderFragment(fragment: Fragment, index: number) {
  if (fragment.fragment_type === 'INCLUDE_WIDGET') {
    return <div key={`${fragment.widget_name}-${index}`}>{renderWidget(fragment)}</div>;
  }

  if (fragment.fragment_type === 'EMBED_CONTENT') {
    return (
      <section
        key={`${fragment.display_name}-${index}`}
        className="proposal-rich mb-6 text-[12.5px] leading-6 text-stone-700 [&_a]:text-[#7c4f22] [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mb-3 [&_h2]:font-serif [&_h2]:text-[24px] [&_h2]:font-semibold [&_h2]:text-stone-950 [&_h3]:mb-2 [&_h3]:font-serif [&_h3]:text-[20px] [&_h3]:font-semibold [&_h3]:text-stone-950 [&_h4]:mb-2 [&_h4]:mt-4 [&_h4]:text-[12px] [&_h4]:font-semibold [&_h4]:uppercase [&_h4]:tracking-[0.16em] [&_h4]:text-stone-600 [&_hr]:my-4 [&_hr]:border-stone-200 [&_li]:mb-1 [&_ol]:pl-5 [&_p]:my-0 [&_ul]:pl-5"
        dangerouslySetInnerHTML={{ __html: fragment.html_content }}
      />
    );
  }

  return null;
}

export default function ProposalPdfPage() {
  const pages = getPages(fragments);
  const pageScale = 816 / pageWidth;
  const contentStyle = {
    paddingTop: `${contentFrame.top_margin * pageScale}px`,
    paddingRight: `${contentFrame.right_margin * pageScale}px`,
    paddingBottom: `${contentFrame.bottom_margin * pageScale}px`,
    paddingLeft: `${contentFrame.left_margin * pageScale}px`,
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#efe7dc,transparent_28%),linear-gradient(180deg,#d8cec2_0%,#cfc3b5_38%,#e8dfd6_100%)] px-4 py-10 text-stone-900 md:px-8">
      <div className="mx-auto mb-8 max-w-[980px] text-center">
        <p className="text-[11px] uppercase tracking-[0.28em] text-stone-600">Proposal PDF Preview</p>
        <h1
          className="mt-3 text-[clamp(2rem,4vw,3.4rem)] leading-none text-stone-950"
          style={{ fontFamily: '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", serif' }}
        >
          Quote Template, rebuilt from fragment order
        </h1>
        <p className="mx-auto mt-4 max-w-[44rem] text-[14px] leading-7 text-stone-700">
          This route treats <code>render_html</code> as preview-only for widgets, keeps embedded content as authored text,
          and reconstructs the proposal as printable letter pages.
        </p>
      </div>

      <div className="mx-auto flex max-w-[980px] flex-col gap-8">
        {pages.map((page, pageIndex) => (
          <section
            key={`page-${pageIndex + 1}`}
            className="relative mx-auto w-full max-w-[816px] overflow-hidden rounded-[22px] border border-stone-300 bg-[#fffdfa] shadow-[0_24px_80px_rgba(60,42,22,0.18)]"
          >
            <div className="absolute inset-x-0 top-0 h-10 bg-[linear-gradient(180deg,rgba(120,87,51,0.08),transparent)]" />
            <div className="relative min-h-[1056px]" style={contentStyle}>
              {page.map((fragment, index) => renderFragment(fragment, index))}
            </div>
            {!pageNumber.hide_page_number && (
              <div
                className="absolute text-stone-500"
                style={{
                  left: `${pageNumber.left_margin * pageScale}px`,
                  bottom: `${pageNumber.bottom_margin * pageScale + 8}px`,
                  fontSize: `${pageNumber.font_size * pageScale}px`,
                }}
              >
                {pageIndex + 1}
              </div>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
