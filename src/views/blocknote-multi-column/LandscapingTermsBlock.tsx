import React from "react";
import { createReactBlockSpec } from "@blocknote/react";

const TERMS_TEXT = {
  title: "Landscaping terms\n& conditions",
  intro:
    "These terms and conditions apply to any work performed and materials supplied by [Sender.Company] and shall govern the contract unless expressly modified in writing.\n\n\"We,\" \"us,\" \"the contractor,\" and \"our\" represent [Sender.Company]. \"you,\" \"the client,\" \"the customer,\" and \"your\" represent the person who requested services and enters into this contract.",
  springTitle: "Spring cleanups",
  springText:
    "Leaf cleanups and winter debris removal are included in spring lawn and plant maintenance.",
  pruningTitle: "Pruning",
  pruningText:
    "Plants should be pruned twice a year to help keep them healthy and attractive. Pruning is performed during mid-June and early September.",
  mulchTitle: "Mulch",
  mulchText:
    "Plants should be pruned twice a year to help keep them healthy and attractive. Pruning is performed during mid-June and early September.",
  fallTitle: "Fall cleanups",
  fallText:
    "During November, we recommend trimming perennials and cleaning up leaves. Leaf cleanups include cleaning the leaves from the landscaping area and mulching/vacuuming the leaves from your lawn. If curbside vacuuming is required, we will charge an additional fee.",
} as const;

type TermsField = keyof typeof TERMS_TEXT;
type TermsProps = Record<TermsField, string>;

const PAGE_STYLE: React.CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  maxWidth: 760,
  minHeight: 980,
  padding: "74px 48px 170px",
  backgroundColor: "#e6eedf",
  color: "#006550",
  fontFamily: '"Avenir Next", Avenir, "Helvetica Neue", Arial, sans-serif',
};

const HERO_STYLE: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.15fr 1fr",
  columnGap: 72,
  alignItems: "end",
  marginBottom: 50,
};

const TITLE_STYLE: React.CSSProperties = {
  width: "100%",
  minHeight: 148,
  border: 0,
  resize: "none",
  overflow: "hidden",
  background: "transparent",
  color: "#006550",
  font: "inherit",
  fontSize: 60,
  fontWeight: 400,
  lineHeight: 0.98,
  letterSpacing: 0,
  outline: "none",
};

const INTRO_STYLE: React.CSSProperties = {
  width: "100%",
  minHeight: 150,
  border: 0,
  resize: "none",
  overflow: "hidden",
  background: "transparent",
  color: "#4d8f80",
  font: "inherit",
  fontSize: 14,
  fontWeight: 700,
  lineHeight: 1.18,
  outline: "none",
};

const ROW_STYLE: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.15fr 1fr",
  columnGap: 72,
  borderTop: "2px solid #74a79a",
  padding: "13px 0 14px",
};

const NAME_STYLE: React.CSSProperties = {
  width: "100%",
  border: 0,
  resize: "none",
  overflow: "hidden",
  background: "transparent",
  color: "#00705c",
  font: "inherit",
  fontSize: 29,
  fontWeight: 400,
  lineHeight: 1.05,
  outline: "none",
};

const DESCRIPTION_STYLE: React.CSSProperties = {
  width: "100%",
  border: 0,
  resize: "none",
  overflow: "hidden",
  background: "transparent",
  color: "#4d8f80",
  font: "inherit",
  fontSize: 13,
  fontWeight: 700,
  lineHeight: 1.12,
  outline: "none",
};

const textStyle = (
  style: React.CSSProperties,
  overrides?: React.CSSProperties,
): React.CSSProperties => ({
  ...style,
  whiteSpace: "pre-wrap",
  minHeight: undefined,
  resize: undefined,
  overflow: undefined,
  outline: undefined,
  font: undefined,
  ...overrides,
});

function LeafShape() {
  return (
    <svg
      viewBox="0 0 260 150"
      aria-hidden="true"
      style={{
        width: "76%",
        maxWidth: 240,
        display: "block",
        margin: "18px auto 0 34px",
      }}
    >
      <path
        d="M39 96 C12 51 37 24 62 70 C68 30 103 1 118 33 C127 9 174 6 169 45 C192 26 234 34 215 73 C199 111 157 121 124 102 C96 130 62 128 39 96 Z"
        fill="#00a95b"
      />
      <path
        d="M31 96 C-2 42 27 18 55 72 C66 28 104 -4 123 34 C116 75 94 117 55 121 C45 118 37 110 31 96 Z"
        fill="#3fdf4b"
      />
    </svg>
  );
}

function EditableField({
  field,
  value,
  style,
  rows = 1,
  onChange,
}: {
  field: TermsField;
  value: string;
  style: React.CSSProperties;
  rows?: number;
  onChange: (field: TermsField, value: string) => void;
}) {
  const [draft, setDraft] = React.useState(value);

  React.useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <textarea
      aria-label={field}
      value={draft}
      rows={rows}
      spellCheck={false}
      style={style}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => {
        if (draft !== value) {
          onChange(field, draft);
        }
      }}
      onKeyDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    />
  );
}

function StaticField({
  value,
  style,
}: {
  value: string;
  style: React.CSSProperties;
}) {
  return <div style={textStyle(style)}>{value}</div>;
}

function TermsRow({
  titleField,
  textField,
  props,
  editable,
  onChange,
}: {
  titleField: TermsField;
  textField: TermsField;
  props: TermsProps;
  editable: boolean;
  onChange: (field: TermsField, value: string) => void;
}) {
  return (
    <div style={ROW_STYLE}>
      {editable ? (
        <EditableField
          field={titleField}
          value={props[titleField]}
          style={NAME_STYLE}
          onChange={onChange}
        />
      ) : (
        <StaticField value={props[titleField]} style={NAME_STYLE} />
      )}
      {editable ? (
        <EditableField
          field={textField}
          value={props[textField]}
          style={DESCRIPTION_STYLE}
          rows={textField === "fallText" ? 8 : 3}
          onChange={onChange}
        />
      ) : (
        <StaticField value={props[textField]} style={DESCRIPTION_STYLE} />
      )}
    </div>
  );
}

function LandscapingTermsLayout({
  props,
  editable,
  onChange,
}: {
  props: TermsProps;
  editable: boolean;
  onChange: (field: TermsField, value: string) => void;
}) {
  return (
    <section style={PAGE_STYLE} contentEditable={false}>
      <div style={HERO_STYLE}>
        <div>
          {editable ? (
            <EditableField
              field="title"
              value={props.title}
              rows={2}
              style={TITLE_STYLE}
              onChange={onChange}
            />
          ) : (
            <StaticField value={props.title} style={TITLE_STYLE} />
          )}
          <LeafShape />
        </div>
        {editable ? (
          <EditableField
            field="intro"
            value={props.intro}
            rows={8}
            style={INTRO_STYLE}
            onChange={onChange}
          />
        ) : (
          <StaticField value={props.intro} style={INTRO_STYLE} />
        )}
      </div>
      <TermsRow
        titleField="springTitle"
        textField="springText"
        props={props}
        editable={editable}
        onChange={onChange}
      />
      <TermsRow
        titleField="pruningTitle"
        textField="pruningText"
        props={props}
        editable={editable}
        onChange={onChange}
      />
      <TermsRow
        titleField="mulchTitle"
        textField="mulchText"
        props={props}
        editable={editable}
        onChange={onChange}
      />
      <TermsRow
        titleField="fallTitle"
        textField="fallText"
        props={props}
        editable={editable}
        onChange={onChange}
      />
      <div style={{ borderTop: "2px solid #74a79a" }} />
    </section>
  );
}

export const LANDSCAPING_TERMS_BLOCK = {
  type: "landscapingTerms" as const,
};

export const createLandscapingTerms = createReactBlockSpec(
  {
    type: "landscapingTerms" as const,
    propSchema: {
      title: { default: TERMS_TEXT.title },
      intro: { default: TERMS_TEXT.intro },
      springTitle: { default: TERMS_TEXT.springTitle },
      springText: { default: TERMS_TEXT.springText },
      pruningTitle: { default: TERMS_TEXT.pruningTitle },
      pruningText: { default: TERMS_TEXT.pruningText },
      mulchTitle: { default: TERMS_TEXT.mulchTitle },
      mulchText: { default: TERMS_TEXT.mulchText },
      fallTitle: { default: TERMS_TEXT.fallTitle },
      fallText: { default: TERMS_TEXT.fallText },
    },
    content: "none",
  },
  {
    render: ({ block, editor }) => {
      const updateField = (field: TermsField, value: string) => {
        editor.updateBlock(block, {
          props: {
            ...block.props,
            [field]: value,
          },
        });
      };

      return (
        <LandscapingTermsLayout
          props={block.props as TermsProps}
          editable={true}
          onChange={updateField}
        />
      );
    },
    toExternalHTML: ({ block }) => (
      <LandscapingTermsLayout
        props={block.props as TermsProps}
        editable={false}
        onChange={() => undefined}
      />
    ),
  },
);
