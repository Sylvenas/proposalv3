import proposalTemplate from '../../proposal-pdf/data.json';
import { getRawWidgetHtml, type WidgetVars } from '../../proposal-pdf/proposal-preview-data';

type Fragment = {
  fragment_type: string;
  widget_name?: string;
  widget_vars_value?: WidgetVars | null;
  render_html?: string;
  html_content?: string;
};

const paragraphStyle = `
input[type=button]{font-size: inherit;color:inherit;font:inherit;background: inherit;}
.customDataToken{border:1px dashed #04b50b;border-radius:2px;padding:0 2px; line-height:1 !important}
`;

const commentStyle = `
html,
body {
  font-family: Helvetica, 'Noto Sans', 'Lucida Grande', Verdana, Arial, sans-serif;
  font-size: 10pt;
  width: 100%;
  line-height: 1.5;
  color: #434343;
  background: #fff;
}

html,
body,
div,
span,
applet,
object,
iframe,
h1,
h2,
h3,
h4,
h5,
h6,
p,
blockquote,
pre,
a,
abbr,
acronym,
address,
big,
cite,
code,
del,
dfn,
em,
img,
ins,
kbd,
q,
s,
samp,
small,
strike,
strong,
sub,
sup,
tt,
var,
b,
u,
i,
center,
dl,
dt,
dd,
fieldset,
form,
label,
legend,
table,
caption,
tbody,
tfoot,
thead,
tr,
th,
td,
article,
aside,
canvas,
details,
embed,
figure,
figcaption,
footer,
header,
hgroup,
menu,
nav,
output,
ruby,
section,
summary,
time,
mark,
audio,
video {
  margin: 0;
  padding: 0;
}

table {
  border-collapse: collapse;
  border-spacing: 0;
  width: 100%;
}

.text-right { text-align: right; }
.text-left { text-align: left; }
.text-center { text-align: center; }
.fs20 { font-size: 20pt; font-weight: bold; }
.fs12 { font-size: 12pt; }
.fs10 { font-size: 10pt; }
.fs9 { font-size: 9pt; }
.fs8 { font-size: 8pt; }
.font-size-16 { font-size: 16px; }
.font-size-22 { font-size: 22px; }
.font-size-12 { font-size: 12px; }
.font-size-14 { font-size: 14px; }
.font-normal { font-weight: 400; }
.font-bold { font-weight: 600; }
.dark-color { color: #000; }
.normal-color { color: #434343; }
.light-dark-color { color: #999; }
.body2-color { color: #666; }
.mt16 { margin-top: 16pt; }
.mt48 { margin-top: 48pt; }
.mb16 { margin-bottom: 16pt; }
.ml16 { margin-left: 16pt; }
.lh18 { line-height: 1.8; }
.lh24 { line-height: 2.4; }
.w100 { width: 100%; }
.w70 { width: 70%; }
.w50 { width: 50%; }
.w33 { width: 33.3%; }
.w30 { width: 30%; }
.w25 { width: 25%; }
.w20 { width: 20%; }
.fl { float: left; }
.fr { float: right; }
.header { font-size: 12pt; color: #000; font-weight: bold; }
.body-strong { font-size: 10pt; color: #303030; font-weight: bold; }
.divider-top { border-top: 1pt solid #cccccc; }
.table-header-bg-light { background: #efefef; }
.table-header { font-size: 12pt; }
.text-sm { font-size: 10pt; }
.text-md { font-size: 12pt; }
.bg-gray { background-color: #efefef; }
.text-gray { color: #999999; }
.body { font-size: 10pt; color: #434343; }
.body2 { font-size: 10pt; color: #666666; line-height: 1; }
.body3 { font-size: 10pt; color: #999999; line-height: 1; }
.body-on-dark { font-size: 10pt; color: #ffffff; line-height: 1; }
.table-header-bg-dark { background: #666666; }
.page-header { font-size: 10pt; color: #434343; }
.page-header-small { font-size: 8pt; color: #999999; }
.page-header-title { font-size: 8pt; color: #999999; font-weight: bold; }
.flex { display: flex; }
.flex-grow { flex-grow: 1; }
.flex-grow-0 { flex-grow: 0; }
.flex-col { flex-direction: column; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.object-contain { object-fit: contain; }
.align-center { align-items: center; }
.light-color { color: #a6a6a6; }
.text-underline { text-decoration: underline; }
.line-height-5 { line-height: 1.5; }
.line-height-4 { line-height: 1.4; }
.line-height-3 { line-height: 1.3; }
.line-height-2 { line-height: 1.2; }
`;

function buildRawHtml(fragments: Fragment[]) {
  const body = fragments
    .flatMap((fragment) => {
      if (fragment.fragment_type === 'INCLUDE_WIDGET' && fragment.widget_name) {
        const widgetHtml = getRawWidgetHtml(fragment.widget_name, fragment.widget_vars_value ?? null);
        return widgetHtml ? [widgetHtml] : [fragment.render_html ?? ''];
      }

      if (fragment.fragment_type === 'EMBED_CONTENT' && fragment.html_content) {
        return [fragment.html_content];
      }

      if (fragment.fragment_type === 'PAGE_BREAK_SETTINGS') {
        return ['<div style="height: 24px"></div>'];
      }

      return [];
    })
    .join('\n');

  const styleTag = `<style>${commentStyle}${paragraphStyle}</style>`;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Proposal PDF Raw Embed</title>
    ${styleTag}
  </head>
  <body>
    ${body}
  </body>
</html>`;
}

export default function ProposalPdf2EmbedPage() {
  const fragments = proposalTemplate.data.template_object.fragments as Fragment[];
  const srcDoc = buildRawHtml(fragments);

  return (
    <iframe
      title="Proposal PDF raw embed"
      srcDoc={srcDoc}
      style={{
        width: '100%',
        minHeight: '3600px',
        border: '0',
        display: 'block',
        background: '#fff',
      }}
    />
  );
}
