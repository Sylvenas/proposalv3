import proposalTemplate from '../proposal-pdf/data.json';
import { getRawWidgetHtml, type WidgetVars } from '../proposal-pdf/proposal-preview-data';

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
  font-family: Helvetica, 'Noto Sans', 'Lucida Grande', Verdana, Arial,
    sans-serif;
  font-size: 10pt;
  width: 100%;
  line-height: 1.5;
  color: #434343;
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

.text-right {
  text-align: right;
}

.text-left {
  text-align: left;
}

.text-center {
  text-align: center;
}

.fs20 {
  font-size: 20pt;
  font-weight: bold;
}

.fs12 {
  font-size: 12pt;
}

.fs10 {
  font-size: 10pt;
}

.fs9 {
  font-size: 9pt;
}

.fs8 {
  font-size: 8pt;
}

.font-size-16 {
  font-size: 16px;
}

.font-size-22 {
  font-size: 22px;
}

.font-size-12 {
  font-size: 12px;
}

.font-size-14 {
  font-size: 14px;
}

.font-normal {
  font-weight: 400;
}

.font-bold {
  font-weight: 600;
}

.dark-color {
  color: #000;
}

.normal-color {
  color: #434343;
}

.light-dark-color {
  color: #999;
}

.body2-color {
  color: #666;
}

.mt16 {
  margin-top: 16pt;
}

.mt48 {
  margin-top: 48pt;
}

.mb16 {
  margin-bottom: 16pt;
}

.ml16 {
  margin-left: 16pt;
}

.lh18 {
  line-height: 1.8;
}

.lh24 {
  line-height: 2.4;
}

.w100 {
  width: 100%;
}

.w70 {
  width: 70%;
}

.w50 {
  width: 50%;
}

.w33 {
  width: 33.3%;
}

.w30 {
  width: 30%;
}

.w25 {
  width: 25%;
}

.w20 {
  width: 20%;
}

.fl {
  float: left;
}

.fr {
  float: right;
}

.header {
  font-size: 12pt;
  color: #000;
  font-weight: bold;
}

.body-strong {
  font-size: 10pt;
  color: #303030;
  font-weight: bold;
}

.divider-top {
  border-top: 1pt solid #cccccc;
}

.table-header-bg-light {
  background: #efefef;
}

.table-header {
  font-size: 12pt;
}

.font-bold {
  font-weight: bold;
}

.text-sm {
  font-size: 10pt;
}

.text-md {
  font-size: 12pt;
}

.bg-gray {
  background-color: #efefef;
}

.text-gray {
  color: #999999;
}

.body {
  font-size: 10pt;
  color: #434343;
}

.body2 {
  font-size: 10pt;
  color: #666666;
  line-height: 1;
}

.body3 {
  font-size: 10pt;
  color: #999999;
  line-height: 1;
}

.body-on-dark {
  font-size: 10pt;
  color: #ffffff;
  line-height: 1;
}

.table-header-bg-dark {
  background: #666666;
}

.page-header {
  font-size: 10pt;
  color: #434343;
}

.page-header-small {
  font-size: 8pt;
  color: #999999;
}

.page-header-title {
  font-size: 8pt;
  color: #999999;
  font-weight: bold;
}

.flex {
  display: flex;
}

.flex-grow {
  flex-grow: 1;
}

.flex-grow-0 {
  flex-grow: 0;
}

.flex-col {
  flex-direction: column;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.object-contain {
  object-fit: contain;
}

.align-center {
  align-items: center;
}

.light-color {
  color: #a6a6a6;
}

.text-underline {
  text-decoration: underline;
}

.line-height-5 {
  line-height: 1.5;
}

.line-height-4 {
  line-height: 1.4;
}

.line-height-3 {
  line-height: 1.3;
}

.line-height-2 {
  line-height: 1.2;
}
`;

const frameStyle = `
.widget-list-wrap {
  height: 100%;
  overflow-y: auto;
  background: #f5f5f5;
}

.widget-list-wrap::-webkit-scrollbar {
  display: none;
}

.proposal-detail-content {
  margin: 0 auto;
  margin-bottom: 48px;
  cursor: pointer;
}

.proposal-detail-content:last-child {
  margin-bottom: 0px;
}

.proposal-detail-content .proposal-detail-content_title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 6px 10px;
  font-size: 14px;
}

.proposal-detail-content .proposal-detail-content_title .proposal-detail-content_title-operate {
  opacity: 0;
  transition: all ease-in 0.3s;
  flex-shrink: 0;
}

.proposal-detail-content .proposal-detail-content_title .proposal-detail-content_title_opacity {
  opacity: 1;
}

.proposal-detail-content:hover .proposal-detail-content_title .proposal-detail-content_title-operate {
  opacity: 1;
  flex-shrink: 0;
}

.proposal-detail-content .proposal-detail-content_title .set-title {
  align-items: center;
  color: rgba(0, 0, 0, 0.55);
}

.proposal-detail-content .proposal-detail-content_title .set-icon-1 {
  display: inline-block;
  margin-right: 5px;
}

.proposal-detail-content .proposal-detail-content_title .set-icon-2 {
  display: none;
  margin-right: 5px;
}

.proposal-detail-content:hover .proposal-detail-content_title .set-title {
  color: rgba(0, 0, 0, 0.85);
}

.proposal-detail-content:hover .proposal-detail-content_title .set-icon-1 {
  display: none;
}

.proposal-detail-content:hover .proposal-detail-content_title .set-icon-2 {
  display: inline-block;
}

.proposal-detail-content .proposal-detail-content_title .set-icon {
  margin-right: 5px;
}

.widget-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 4px 15px;
  font-size: 14px;
  line-height: 1.5715;
  border-radius: 6px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  box-sizing: border-box;
  white-space: nowrap;
  user-select: none;
}

.widget-button-primary {
  color: #fff;
  background: #1677ff;
  border-color: #1677ff;
}

.widget-button-primary:hover {
  background: #4096ff;
  border-color: #4096ff;
}

.widget-button-primary:active {
  background: #0958d9;
  border-color: #0958d9;
}

.widget-button-default {
  color: rgba(0, 0, 0, 0.88);
  background: #fff;
  border-color: #d9d9d9;
}

.widget-button-default:hover {
  color: #4096ff;
  border-color: #4096ff;
}

.widget-button-default:active {
  color: #0958d9;
  border-color: #0958d9;
}

.widget-button-danger {
  color: #ff4d4f;
  background: #fff;
  border-color: #ff4d4f;
}

.widget-button-danger:hover {
  color: #ff7875;
  border-color: #ff7875;
}

.widget-button-danger:active {
  color: #d9363e;
  border-color: #d9363e;
}

.widget-button-icon {
  display: inline-flex;
  align-items: center;
  width: 16px;
  height: 16px;
  margin-right: 8px;
}

.widget-button-icon svg {
  width: 16px;
  height: 16px;
}

.proposal-detail-content .delete-button {
  display: none;
}

.proposal-detail-content .page-break-section:hover .delete-button,
.proposal-detail-content .page-break-section-active .delete-button {
  display: inline-flex;
}

.proposal-detail-content .page-break-section:hover {
  box-shadow: 0 0 0 2px #398ae7;
}

.proposal-detail-content .page-break-section-active {
  box-shadow: 0 0 0 1px #bfbfbf;
}

.proposal-detail-content .page-break-section:hover .delete-button,
.proposal-detail-content .page-break-section-active .delete-button {
  display: inline-block;
}

.proposal-detail-content .proposal-detail-content_title > :nth-child(1) {
  font-weight: bold;
}

.widget-content {
  min-height: 240px;
  background: #fff;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.proposal-detail-content:hover .widget-content {
  border: 2px solid #398ae7 !important;
}

.widget-content .spin-wrap {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.proposal-detail-content .widget-content .mask {
  opacity: 0;
}

.proposal-detail-content:hover .widget-content .mask {
  opacity: 1;
}

html,
body,
.frame-root,
.frame-content {
  height: 100%;
}

.proposal-template-empty-section {
  padding: 24px;
  border-radius: 12px;
  background: #ebebeb;
  width: 825px;
}

.proposal-template-empty-section > .content {
  padding: 54px 0px;
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: stretch;
}

.proposal-template-empty-section > .content > h3 {
  font-size: 16px;
  color: rgba(0, 0, 0, 0.55);
  line-height: 22px;
  font-weight: 400;
}

.proposal-template-empty-section > .content > span {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.25);
  line-height: 18px;
}
`;

const ifBlockStyles = ``;

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
        return ['<div></div>'];
      }

      return [];
    })
    .join('\n');

  const styleTag = `<style>${commentStyle}${paragraphStyle}${ifBlockStyles}${frameStyle}</style>`;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Proposal PDF Raw Preview</title>
    ${styleTag}
  </head>
  <body>
    ${body}
  </body>
</html>`;
}

export default function ProposalPdf2Page() {
  const fragments = proposalTemplate.data.template_object.fragments as Fragment[];
  const srcDoc = buildRawHtml(fragments);

  return (
    <main className="min-h-screen bg-white px-4 py-10 md:px-8">
      <div className="mx-auto w-full max-w-[816px] overflow-hidden bg-white">
        <iframe
          title="Proposal PDF raw preview"
          srcDoc={srcDoc}
          style={{
            width: '100%',
            minHeight: '1056px',
            border: '0',
            display: 'block',
            background: '#fff',
          }}
        />
      </div>
    </main>
  );
}
