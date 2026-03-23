'use client';

import {
  BaseBoxShapeUtil,
  HTMLContainer,
  T,
} from 'tldraw';

import type { ProposalModuleType } from './moduleCatalog';

export interface ProposalTextShape {
  id: string;
  type: 'proposal-text';
  x: number;
  y: number;
  rotation: number;
  props: {
    w: number;
    h: number;
    text: string;
    fontSize: number;
    fontWeight: '400' | '500' | '600' | '700';
    color: string;
    textAlign: 'left' | 'center' | 'right';
  };
}

export class ProposalTextShapeUtil extends BaseBoxShapeUtil<any> {
  static override type = 'proposal-text' as const;

  static override props = {
    w: T.number,
    h: T.number,
    text: T.string,
    fontSize: T.number,
    fontWeight: T.string,
    color: T.string,
    textAlign: T.string,
  };

  override getDefaultProps(): ProposalTextShape['props'] {
    return {
      w: 320,
      h: 72,
      text: 'Text block',
      fontSize: 28,
      fontWeight: '600',
      color: '#172033',
      textAlign: 'left',
    };
  }

  override component(shape: ProposalTextShape) {
    return (
      <HTMLContainer
        className="flex size-full overflow-hidden rounded-[8px] border border-transparent"
        style={{
          alignItems: 'center',
          justifyContent:
            shape.props.textAlign === 'center'
              ? 'center'
              : shape.props.textAlign === 'right'
                ? 'flex-end'
                : 'flex-start',
          padding: '8px 12px',
        }}
      >
        <div
          style={{
            width: '100%',
            color: shape.props.color,
            fontSize: `${shape.props.fontSize}px`,
            fontWeight: Number(shape.props.fontWeight),
            lineHeight: 1.2,
            textAlign: shape.props.textAlign,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {shape.props.text}
        </div>
      </HTMLContainer>
    );
  }

  override indicator(shape: ProposalTextShape) {
    return <rect width={shape.props.w} height={shape.props.h} rx={10} ry={10} />;
  }
}

export interface ProposalModuleShape {
  id: string;
  type: 'proposal-module';
  x: number;
  y: number;
  rotation: number;
  props: {
    w: number;
    h: number;
    moduleType: ProposalModuleType;
    moduleKey: string;
    label: string;
    description: string;
    accent: string;
  };
}

export class ProposalModuleShapeUtil extends BaseBoxShapeUtil<any> {
  static override type = 'proposal-module' as const;

  static override props = {
    w: T.number,
    h: T.number,
    moduleType: T.string,
    moduleKey: T.string,
    label: T.string,
    description: T.string,
    accent: T.string,
  };

  override canEdit() {
    return false;
  }

  override getDefaultProps(): ProposalModuleShape['props'] {
    return {
      w: 360,
      h: 160,
      moduleType: 'placeholder-title',
      moduleKey: 'proposal.title',
      label: 'Title Placeholder',
      description: 'Server-filled placeholder block',
      accent: '#eb6a2a',
    };
  }

  override component(shape: ProposalModuleShape) {
    return (
      <HTMLContainer className="size-full">
        <div
          className="flex size-full flex-col justify-between overflow-hidden rounded-[20px] border bg-white/96 p-4 shadow-[0_18px_42px_rgba(15,23,42,0.14)]"
          style={{
            borderColor: `${shape.props.accent}55`,
            boxShadow: `0 18px 42px ${shape.props.accent}1c`,
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Module
              </p>
              <h3 className="m-0 mt-2 text-[18px] font-semibold tracking-[-0.03em] text-slate-900">
                {shape.props.label}
              </h3>
            </div>
            <span
              className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]"
              style={{
                background: `${shape.props.accent}18`,
                color: shape.props.accent,
              }}
            >
              {shape.props.moduleType}
            </span>
          </div>

          <p className="m-0 mt-4 text-[13px] leading-6 text-slate-500">
            {shape.props.description}
          </p>

          <div className="mt-5 flex items-center justify-between gap-3 rounded-[14px] bg-slate-50 px-3 py-2">
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
              Server Key
            </span>
            <code className="text-[12px] font-semibold text-slate-700">
              {shape.props.moduleKey}
            </code>
          </div>
        </div>
      </HTMLContainer>
    );
  }

  override indicator(shape: ProposalModuleShape) {
    return <rect width={shape.props.w} height={shape.props.h} rx={20} ry={20} />;
  }
}

export const proposalShapeUtils = [ProposalTextShapeUtil, ProposalModuleShapeUtil];
