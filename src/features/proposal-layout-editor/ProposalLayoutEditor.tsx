'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import {
  DefaultColorStyle,
  DefaultDashStyle,
  DefaultFontStyle,
  DefaultFillStyle,
  DefaultSizeStyle,
  DefaultTextAlignStyle,
  FONT_SIZES,
  GeoShapeGeoStyle,
  STROKE_SIZES,
  Tldraw,
  createShapeId,
  type Editor,
  type TLGeoShape,
  type TLImageShape,
  type TLLineShape,
  type TLTextShape,
  useEditor,
  useValue,
} from 'tldraw';

import {
  PROPOSAL_MODULES,
  getModuleDefinition,
  type ProposalModuleDefinition,
} from './moduleCatalog';
import { exportProposalDocument } from './schema';
import { proposalShapeUtils, type ProposalModuleShape, type ProposalTextShape } from './shapes';

type ShapeSelection =
  | TLTextShape
  | TLImageShape
  | TLGeoShape
  | TLLineShape
  | ProposalTextShape
  | ProposalModuleShape
  | null;
type NativeTextColor =
  | 'black'
  | 'blue'
  | 'green'
  | 'grey'
  | 'light-blue'
  | 'light-green'
  | 'light-red'
  | 'light-violet'
  | 'orange'
  | 'red'
  | 'violet'
  | 'white'
  | 'yellow';
type NativeTextSize = 's' | 'm' | 'l' | 'xl';
type NativeTextFont = 'draw' | 'mono' | 'sans' | 'serif';
type NativeTextAlign = 'start' | 'middle' | 'end';
type NativeDash = 'dashed' | 'dotted' | 'draw' | 'solid';
type NativeFill = 'fill' | 'lined-fill' | 'none' | 'pattern' | 'semi' | 'solid';
type NativeShapeSize = 's' | 'm' | 'l' | 'xl';
type NativeLineSpline = 'cubic' | 'line';

const NATIVE_TEXT_COLORS: Array<{
  value: NativeTextColor;
  label: string;
  swatch: string;
}> = [
  { value: 'white', label: 'White', swatch: '#ffffff' },
  { value: 'black', label: 'Black', swatch: '#111827' },
  { value: 'grey', label: 'Grey', swatch: '#6b7280' },
  { value: 'blue', label: 'Blue', swatch: '#2563eb' },
  { value: 'light-blue', label: 'Light Blue', swatch: '#60a5fa' },
  { value: 'green', label: 'Green', swatch: '#15803d' },
  { value: 'light-green', label: 'Light Green', swatch: '#4ade80' },
  { value: 'orange', label: 'Orange', swatch: '#ea580c' },
  { value: 'red', label: 'Red', swatch: '#dc2626' },
  { value: 'light-red', label: 'Light Red', swatch: '#f87171' },
  { value: 'violet', label: 'Violet', swatch: '#7c3aed' },
  { value: 'light-violet', label: 'Light Violet', swatch: '#a78bfa' },
  { value: 'yellow', label: 'Yellow', swatch: '#ca8a04' },
];

const NATIVE_TEXT_SIZES: Array<{ value: NativeTextSize; label: string }> = [
  { value: 's', label: `Small (${FONT_SIZES.s}px)` },
  { value: 'm', label: `Medium (${FONT_SIZES.m}px)` },
  { value: 'l', label: `Large (${FONT_SIZES.l}px)` },
  { value: 'xl', label: `XL (${FONT_SIZES.xl}px)` },
];

const NATIVE_TEXT_FONTS: Array<{ value: NativeTextFont; label: string }> = [
  { value: 'sans', label: 'Sans' },
  { value: 'serif', label: 'Serif' },
  { value: 'mono', label: 'Mono' },
  { value: 'draw', label: 'Draw' },
];

const NATIVE_TEXT_ALIGNS: Array<{ value: NativeTextAlign; label: string }> = [
  { value: 'start', label: 'Left' },
  { value: 'middle', label: 'Center' },
  { value: 'end', label: 'Right' },
];

const NATIVE_SHAPE_SIZES: Array<{ value: NativeShapeSize; label: string }> = [
  { value: 's', label: `Small (${STROKE_SIZES.s}px)` },
  { value: 'm', label: `Medium (${STROKE_SIZES.m}px)` },
  { value: 'l', label: `Large (${STROKE_SIZES.l}px)` },
  { value: 'xl', label: `XL (${STROKE_SIZES.xl}px)` },
];

const NATIVE_DASHES: Array<{ value: NativeDash; label: string }> = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
  { value: 'draw', label: 'Draw' },
];

const NATIVE_FILLS: Array<{ value: NativeFill; label: string }> = [
  { value: 'none', label: 'None' },
  { value: 'semi', label: 'Semi' },
  { value: 'solid', label: 'Solid' },
  { value: 'pattern', label: 'Pattern' },
  { value: 'fill', label: 'Fill' },
  { value: 'lined-fill', label: 'Lined Fill' },
];

const NATIVE_OPACITIES: Array<{ value: number; label: string }> = [
  { value: 0.1, label: '10%' },
  { value: 0.25, label: '25%' },
  { value: 0.5, label: '50%' },
  { value: 0.75, label: '75%' },
  { value: 1, label: '100%' },
];

const NATIVE_LINE_SPLINES: Array<{ value: NativeLineSpline; label: string }> = [
  { value: 'line', label: 'Straight' },
  { value: 'cubic', label: 'Curved' },
];

function clampDimension(value: number, fallback: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }

  return Math.round(value);
}

function getShapeLabel(shape: any) {
  if (!shape) {
    return 'Nothing selected';
  }

  if (shape.type === 'proposal-module') {
    return shape.props.label;
  }

  if (shape.type === 'proposal-text') {
    return 'Text Block';
  }

  if (shape.type === 'image') {
    return shape.props.altText || 'Image';
  }

  if (shape.type === 'geo') {
    return shape.props.geo === 'rectangle' ? 'Rectangle' : 'Shape';
  }

  if (shape.type === 'line') {
    return 'Line';
  }

  if (shape.type === 'text') {
    return 'Text';
  }

  return shape.type;
}

async function exportCurrentPageSvg(editor: Editor) {
  const shapes = editor.getCurrentPageShapesSorted();
  if (!shapes.length) {
    return '';
  }

  const result = await editor.getSvgString(shapes, {
    background: true,
    padding: 16,
  });

  return result?.svg ?? '';
}

function ProposalEditorHud({
  fileInputRef,
  onExport,
  onExportSvg,
}: {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onExport: (payload: string) => void;
  onExportSvg: (payload: string) => void;
}) {
  const editor = useEditor();
  const selectedShape = useValue(
    'selected-shape',
    () => editor.getOnlySelectedShape() as ShapeSelection,
    [editor]
  );
  const canUndo = useValue('can-undo', () => editor.canUndo(), [editor]);
  const canRedo = useValue('can-redo', () => editor.canRedo(), [editor]);
  const [isModulePanelOpen, setIsModulePanelOpen] = useState(false);

  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center px-6 pt-4">
        <div className="pointer-events-auto flex items-center gap-2 rounded-[18px] border border-white/70 bg-white/90 px-3 py-2 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur">
          <ToolbarButton
            label="Text"
            onClick={() => editor.setCurrentTool('text')}
          />
          <ToolbarButton
            label="Rectangle"
            onClick={() => {
              editor.setStyleForNextShapes(GeoShapeGeoStyle, 'rectangle');
              editor.setCurrentTool('geo');
            }}
          />
          <ToolbarButton
            label="Line"
            onClick={() => editor.setCurrentTool('line')}
          />
          <ToolbarButton
            label="Image"
            onClick={() => fileInputRef.current?.click()}
          />
          <ToolbarButton
            label="Duplicate"
            onClick={() => {
              const ids = editor.getSelectedShapeIds();
              if (ids.length) {
                editor.duplicateShapes(ids, { x: 24, y: 24 });
              }
            }}
            disabled={!selectedShape}
          />
          <ToolbarButton
            label="Delete"
            onClick={() => {
              const ids = editor.getSelectedShapeIds();
              if (ids.length) {
                editor.deleteShapes(ids);
              }
            }}
            disabled={!selectedShape}
          />
          <div className="mx-1 h-6 w-px bg-slate-200" />
          <ToolbarButton label="Undo" onClick={() => editor.undo()} disabled={!canUndo} />
          <ToolbarButton label="Redo" onClick={() => editor.redo()} disabled={!canRedo} />
          <div className="mx-1 h-6 w-px bg-slate-200" />
          <ToolbarButton
            label="Front"
            onClick={() => {
              const ids = editor.getSelectedShapeIds();
              if (ids.length) {
                editor.bringToFront(ids);
              }
            }}
            disabled={!selectedShape}
          />
          <ToolbarButton
            label="Back"
            onClick={() => {
              const ids = editor.getSelectedShapeIds();
              if (ids.length) {
                editor.sendToBack(ids);
              }
            }}
            disabled={!selectedShape}
          />
          <div className="mx-1 h-6 w-px bg-slate-200" />
          <ToolbarButton
            label="Export JSON"
            onClick={() => onExport(JSON.stringify(exportProposalDocument(editor), null, 2))}
          />
          <ToolbarButton
            label="Export SVG"
            onClick={async () => {
              onExportSvg(await exportCurrentPageSvg(editor));
            }}
          />
        </div>
      </div>

      <aside className="pointer-events-none absolute left-4 top-24 z-20 w-[280px]">
        {isModulePanelOpen ? (
          <div className="pointer-events-auto rounded-[24px] border border-white/70 bg-white/92 p-4 shadow-[0_22px_48px_rgba(15,23,42,0.16)] backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Insert
                </p>
                <h2 className="m-0 mt-2 text-[20px] font-semibold tracking-[-0.04em] text-slate-950">
                  Proposal Modules
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsModulePanelOpen(false)}
                className="rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Collapse
              </button>
            </div>

            <p className="m-0 mt-2 text-[13px] leading-6 text-slate-500">
              Add controlled placeholders that the server can replace during PDF
              generation.
            </p>

            <div className="mt-4 space-y-3">
              {PROPOSAL_MODULES.map((module) => (
                <button
                  key={module.type}
                  type="button"
                  onClick={() => {
                    editor.createShape({
                      id: createShapeId(),
                      type: 'proposal-module' as any,
                      x: 140,
                      y: 140,
                      props: {
                        w: module.defaultSize.w,
                        h: module.defaultSize.h,
                        moduleType: module.type,
                        moduleKey: module.key,
                        label: module.label,
                        description: module.description,
                        accent: module.accent,
                      },
                    } as any);
                  }}
                  className="block w-full rounded-[18px] border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-slate-300 hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[14px] font-semibold text-slate-900">
                        {module.label}
                      </div>
                      <div className="mt-1 text-[12px] leading-5 text-slate-500">
                        {module.description}
                      </div>
                    </div>
                    <span
                      className="mt-1 block size-3 rounded-full"
                      style={{ backgroundColor: module.accent }}
                    />
                  </div>
                  <div className="mt-3 text-[11px] uppercase tracking-[0.14em] text-slate-400">
                    {module.key}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="pointer-events-auto inline-flex rounded-[18px] border border-white/70 bg-white/92 shadow-[0_18px_38px_rgba(15,23,42,0.14)] backdrop-blur">
            <button
              type="button"
              onClick={() => setIsModulePanelOpen(true)}
              className="rounded-[18px] px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-700 transition hover:bg-white"
            >
              Modules
            </button>
          </div>
        )}
      </aside>

      <InspectorPanel />
    </>
  );
}

function InspectorPanel() {
  const editor = useEditor();
  const selectedShape = useValue(
    'selected-shape',
    () => editor.getOnlySelectedShape() as ShapeSelection,
    [editor]
  );
  const totalShapes = useValue('shape-count', () => editor.getCurrentPageShapes().length, [editor]);

  return (
    <aside className="pointer-events-none absolute right-4 top-24 z-20 w-[300px]">
      <div className="pointer-events-auto rounded-[24px] border border-white/70 bg-white/92 p-4 shadow-[0_22px_48px_rgba(15,23,42,0.16)] backdrop-blur">
        <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Inspector
        </p>
        <div className="mt-2 flex items-center justify-between gap-4">
          <h2 className="m-0 text-[20px] font-semibold tracking-[-0.04em] text-slate-950">
            {getShapeLabel(selectedShape)}
          </h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            {totalShapes} items
          </span>
        </div>

        {selectedShape ? (
          <div className="mt-4">
            {selectedShape.type === 'proposal-text' && (
              <ProposalTextInspector shape={selectedShape} />
            )}
            {selectedShape.type === 'proposal-module' && (
              <ProposalModuleInspector shape={selectedShape} />
            )}
            {selectedShape.type === 'image' && (
              <ProposalImageInspector shape={selectedShape} />
            )}
            {selectedShape.type === 'geo' && (
              <GeoShapeInspector shape={selectedShape} />
            )}
            {selectedShape.type === 'line' && (
              <LineShapeInspector shape={selectedShape} />
            )}
            {selectedShape.type === 'text' && (
              <DefaultTextInspector shape={selectedShape} />
            )}
          </div>
        ) : (
          <p className="m-0 mt-4 text-[13px] leading-6 text-slate-500">
            Select a single element to edit its properties. The canvas keeps
            full `tldraw` transform behavior for drag, resize, rotate, duplicate,
            and undo/redo.
          </p>
        )}
      </div>
    </aside>
  );
}

function ProposalTextInspector({ shape }: { shape: ProposalTextShape }) {
  const editor = useEditor();

  return (
    <div className="space-y-4">
      <LabeledField label="Content">
        <textarea
          className="min-h-[120px] w-full rounded-[14px] border border-slate-200 px-3 py-2 text-[13px] text-slate-800 outline-none transition focus:border-slate-400"
          value={shape.props.text}
          onChange={(event) =>
            editor.updateShape({
              id: shape.id,
              type: shape.type as any,
              props: { text: event.target.value },
            } as any)
          }
        />
      </LabeledField>

      <div className="grid grid-cols-2 gap-3">
        <LabeledField label="Font Size">
          <input
            type="number"
            min={12}
            max={120}
            className="w-full rounded-[14px] border border-slate-200 px-3 py-2 text-[13px] text-slate-800 outline-none transition focus:border-slate-400"
            value={shape.props.fontSize}
            onChange={(event) =>
              editor.updateShape({
                id: shape.id,
                type: shape.type as any,
                props: { fontSize: clampDimension(Number(event.target.value), 28) },
              } as any)
            }
          />
        </LabeledField>

        <LabeledField label="Weight">
          <select
            className="w-full rounded-[14px] border border-slate-200 px-3 py-2 text-[13px] text-slate-800 outline-none transition focus:border-slate-400"
            value={shape.props.fontWeight}
            onChange={(event) =>
              editor.updateShape({
                id: shape.id,
                type: shape.type as any,
                props: {
                  fontWeight: event.target.value as ProposalTextShape['props']['fontWeight'],
                },
              } as any)
            }
          >
            <option value="400">Regular</option>
            <option value="500">Medium</option>
            <option value="600">Semibold</option>
            <option value="700">Bold</option>
          </select>
        </LabeledField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <LabeledField label="Color">
          <input
            type="color"
            className="h-11 w-full rounded-[14px] border border-slate-200 bg-white px-2 py-2"
            value={shape.props.color}
            onChange={(event) =>
              editor.updateShape({
                id: shape.id,
                type: shape.type as any,
                props: { color: event.target.value },
              } as any)
            }
          />
        </LabeledField>

        <LabeledField label="Align">
          <select
            className="w-full rounded-[14px] border border-slate-200 px-3 py-2 text-[13px] text-slate-800 outline-none transition focus:border-slate-400"
            value={shape.props.textAlign}
            onChange={(event) =>
              editor.updateShape({
                id: shape.id,
                type: shape.type as any,
                props: {
                  textAlign: event.target.value as ProposalTextShape['props']['textAlign'],
                },
              } as any)
            }
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </LabeledField>
      </div>
    </div>
  );
}

function ProposalModuleInspector({ shape }: { shape: ProposalModuleShape }) {
  const editor = useEditor();

  return (
    <div className="space-y-4">
      <LabeledField label="Module Type">
        <select
          className="w-full rounded-[14px] border border-slate-200 px-3 py-2 text-[13px] text-slate-800 outline-none transition focus:border-slate-400"
          value={shape.props.moduleType}
          onChange={(event) => {
            const definition = getModuleDefinition(event.target.value as ProposalModuleDefinition['type']);
            editor.updateShape({
              id: shape.id,
              type: shape.type as any,
              props: {
                moduleType: definition.type,
                moduleKey: definition.key,
                label: definition.label,
                description: definition.description,
                accent: definition.accent,
                w: definition.defaultSize.w,
                h: definition.defaultSize.h,
              },
            } as any);
          }}
        >
          {PROPOSAL_MODULES.map((module) => (
            <option key={module.type} value={module.type}>
              {module.label}
            </option>
          ))}
        </select>
      </LabeledField>

      <LabeledField label="Server Key">
        <input
          className="w-full rounded-[14px] border border-slate-200 px-3 py-2 text-[13px] text-slate-800 outline-none transition focus:border-slate-400"
          value={shape.props.moduleKey}
          onChange={(event) =>
            editor.updateShape({
              id: shape.id,
              type: shape.type as any,
              props: { moduleKey: event.target.value },
            } as any)
          }
        />
      </LabeledField>

      <LabeledField label="Description">
        <textarea
          className="min-h-[100px] w-full rounded-[14px] border border-slate-200 px-3 py-2 text-[13px] text-slate-800 outline-none transition focus:border-slate-400"
          value={shape.props.description}
          onChange={(event) =>
            editor.updateShape({
              id: shape.id,
              type: shape.type as any,
              props: { description: event.target.value },
            } as any)
          }
        />
      </LabeledField>
    </div>
  );
}

function ProposalImageInspector({ shape }: { shape: TLImageShape }) {
  const editor = useEditor();

  return (
    <div className="space-y-4">
      <LabeledField label="Alt Text">
        <input
          className="w-full rounded-[14px] border border-slate-200 px-3 py-2 text-[13px] text-slate-800 outline-none transition focus:border-slate-400"
          value={shape.props.altText}
          onChange={(event) =>
            editor.updateShape({
              id: shape.id,
              type: shape.type as any,
              props: { altText: event.target.value },
            } as any)
          }
        />
      </LabeledField>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Width" value={`${Math.round(shape.props.w)} px`} />
        <StatCard label="Height" value={`${Math.round(shape.props.h)} px`} />
      </div>

      <LabeledField label="Source">
        <code className="block max-h-[160px] overflow-auto rounded-[14px] bg-slate-50 px-3 py-2 text-[12px] leading-5 text-slate-600">
          {shape.props.url}
        </code>
      </LabeledField>
    </div>
  );
}

function GeoShapeInspector({ shape }: { shape: TLGeoShape }) {
  const editor = useEditor();
  const bounds = editor.getShapePageBounds(shape.id);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <LabeledField label="Color">
          <select
            className="w-full rounded-[14px] border border-slate-200 px-3 py-2 text-[13px] text-slate-800 outline-none transition focus:border-slate-400"
            value={shape.props.color}
            onChange={(event) =>
              editor.setStyleForSelectedShapes(
                DefaultColorStyle,
                event.target.value as NativeTextColor
              )
            }
          >
            {NATIVE_TEXT_COLORS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </LabeledField>

        <LabeledField label="Stroke">
          <select
            className="w-full rounded-[14px] border border-slate-200 px-3 py-2 text-[13px] text-slate-800 outline-none transition focus:border-slate-400"
            value={shape.props.size}
            onChange={(event) =>
              editor.setStyleForSelectedShapes(
                DefaultSizeStyle,
                event.target.value as NativeShapeSize
              )
            }
          >
            {NATIVE_SHAPE_SIZES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </LabeledField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <LabeledField label="Dash">
          <select
            className="w-full rounded-[14px] border border-slate-200 px-3 py-2 text-[13px] text-slate-800 outline-none transition focus:border-slate-400"
            value={shape.props.dash}
            onChange={(event) =>
              editor.setStyleForSelectedShapes(
                DefaultDashStyle,
                event.target.value as NativeDash
              )
            }
          >
            {NATIVE_DASHES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </LabeledField>

        <LabeledField label="Fill">
          <select
            className="w-full rounded-[14px] border border-slate-200 px-3 py-2 text-[13px] text-slate-800 outline-none transition focus:border-slate-400"
            value={shape.props.fill}
            onChange={(event) =>
              editor.setStyleForSelectedShapes(
                DefaultFillStyle,
                event.target.value as NativeFill
              )
            }
          >
            {NATIVE_FILLS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </LabeledField>
      </div>

      <LabeledField label="Opacity">
        <select
          className="w-full rounded-[14px] border border-slate-200 px-3 py-2 text-[13px] text-slate-800 outline-none transition focus:border-slate-400"
          value={String(shape.opacity)}
          onChange={(event) =>
            editor.setOpacityForSelectedShapes(Number(event.target.value))
          }
        >
          {NATIVE_OPACITIES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </LabeledField>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Width" value={`${Math.round(bounds?.w ?? shape.props.w)} px`} />
        <StatCard label="Height" value={`${Math.round(bounds?.h ?? shape.props.h)} px`} />
      </div>
    </div>
  );
}

function LineShapeInspector({ shape }: { shape: TLLineShape }) {
  const editor = useEditor();
  const bounds = editor.getShapePageBounds(shape.id);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <LabeledField label="Color">
          <select
            className="w-full rounded-[14px] border border-slate-200 px-3 py-2 text-[13px] text-slate-800 outline-none transition focus:border-slate-400"
            value={shape.props.color}
            onChange={(event) =>
              editor.setStyleForSelectedShapes(
                DefaultColorStyle,
                event.target.value as NativeTextColor
              )
            }
          >
            {NATIVE_TEXT_COLORS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </LabeledField>

        <LabeledField label="Stroke">
          <select
            className="w-full rounded-[14px] border border-slate-200 px-3 py-2 text-[13px] text-slate-800 outline-none transition focus:border-slate-400"
            value={shape.props.size}
            onChange={(event) =>
              editor.setStyleForSelectedShapes(
                DefaultSizeStyle,
                event.target.value as NativeShapeSize
              )
            }
          >
            {NATIVE_SHAPE_SIZES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </LabeledField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <LabeledField label="Dash">
          <select
            className="w-full rounded-[14px] border border-slate-200 px-3 py-2 text-[13px] text-slate-800 outline-none transition focus:border-slate-400"
            value={shape.props.dash}
            onChange={(event) =>
              editor.setStyleForSelectedShapes(
                DefaultDashStyle,
                event.target.value as NativeDash
              )
            }
          >
            {NATIVE_DASHES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </LabeledField>

        <LabeledField label="Path">
          <select
            className="w-full rounded-[14px] border border-slate-200 px-3 py-2 text-[13px] text-slate-800 outline-none transition focus:border-slate-400"
            value={shape.props.spline}
            onChange={(event) =>
              editor.updateShape({
                id: shape.id,
                type: shape.type,
                props: { spline: event.target.value as NativeLineSpline },
              })
            }
          >
            {NATIVE_LINE_SPLINES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </LabeledField>
      </div>

      <LabeledField label="Opacity">
        <select
          className="w-full rounded-[14px] border border-slate-200 px-3 py-2 text-[13px] text-slate-800 outline-none transition focus:border-slate-400"
          value={String(shape.opacity)}
          onChange={(event) =>
            editor.setOpacityForSelectedShapes(Number(event.target.value))
          }
        >
          {NATIVE_OPACITIES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </LabeledField>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Width" value={`${Math.round(bounds?.w ?? 0)} px`} />
        <StatCard label="Height" value={`${Math.round(bounds?.h ?? 0)} px`} />
      </div>
    </div>
  );
}

function DefaultTextInspector({ shape }: { shape: TLTextShape }) {
  const editor = useEditor();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <LabeledField label="Font">
          <select
            className="w-full rounded-[14px] border border-slate-200 px-3 py-2 text-[13px] text-slate-800 outline-none transition focus:border-slate-400"
            value={shape.props.font}
            onChange={(event) =>
              editor.setStyleForSelectedShapes(
                DefaultFontStyle,
                event.target.value as NativeTextFont
              )
            }
          >
            {NATIVE_TEXT_FONTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </LabeledField>

        <LabeledField label="Size">
          <select
            className="w-full rounded-[14px] border border-slate-200 px-3 py-2 text-[13px] text-slate-800 outline-none transition focus:border-slate-400"
            value={shape.props.size}
            onChange={(event) =>
              editor.setStyleForSelectedShapes(
                DefaultSizeStyle,
                event.target.value as NativeTextSize
              )
            }
          >
            {NATIVE_TEXT_SIZES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </LabeledField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <LabeledField label="Color">
          <select
            className="w-full rounded-[14px] border border-slate-200 px-3 py-2 text-[13px] text-slate-800 outline-none transition focus:border-slate-400"
            value={shape.props.color}
            onChange={(event) =>
              editor.setStyleForSelectedShapes(
                DefaultColorStyle,
                event.target.value as NativeTextColor
              )
            }
          >
            {NATIVE_TEXT_COLORS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </LabeledField>

        <LabeledField label="Align">
          <select
            className="w-full rounded-[14px] border border-slate-200 px-3 py-2 text-[13px] text-slate-800 outline-none transition focus:border-slate-400"
            value={shape.props.textAlign}
            onChange={(event) =>
              editor.setStyleForSelectedShapes(
                DefaultTextAlignStyle,
                event.target.value as NativeTextAlign
              )
            }
          >
            {NATIVE_TEXT_ALIGNS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </LabeledField>
      </div>

      <div className="flex flex-wrap gap-2">
        {NATIVE_TEXT_COLORS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-label={option.label}
            onClick={() =>
              editor.setStyleForSelectedShapes(DefaultColorStyle, option.value)
            }
            className={`size-8 rounded-full border-2 transition ${
              shape.props.color === option.value
                ? 'border-slate-900 scale-105'
                : 'border-white shadow-[0_4px_12px_rgba(15,23,42,0.12)]'
            }`}
            style={{ backgroundColor: option.swatch }}
          />
        ))}
      </div>
    </div>
  );
}

function LabeledField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </div>
      {children}
    </label>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] bg-slate-50 px-3 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-[14px] font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function ToolbarButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
    >
      {label}
    </button>
  );
}

export default function ProposalLayoutEditor() {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [exportedJson, setExportedJson] = useState('');
  const [exportedSvg, setExportedSvg] = useState('');
  const [previewMode, setPreviewMode] = useState<'json' | 'svg'>('json');
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleInsertImage(
    editor: Editor,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      await editor.putExternalContent({
        type: 'files',
        files: [file],
      });
    } finally {
      event.target.value = '';
    }
  }

  useEffect(() => {
    if (!editor) {
      return;
    }

    let isActive = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const scheduleSvgExport = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        void exportCurrentPageSvg(editor).then((svg) => {
          if (isActive) {
            setExportedSvg(svg);
            setPreviewMode('svg');
          }
        });
      }, 250);
    };

    scheduleSvgExport();

    const unsubscribe = editor.store.listen(
      () => {
        scheduleSvgExport();
      },
      { source: 'user', scope: 'document' }
    );

    return () => {
      isActive = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      unsubscribe();
    };
  }, [editor]);

  return (
    <main
      className="min-h-screen"
      style={{
        background:
          'radial-gradient(circle at top left, rgba(235,106,42,0.14), transparent 20%), radial-gradient(circle at top right, rgba(59,92,204,0.1), transparent 24%), linear-gradient(180deg, #fcfbf8 0%, #f2eee8 100%)',
      }}
    >
      <div className="border-b border-black/6 bg-white/70 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-6">
          <div>
            <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Tldraw Prototype
            </p>
            <h1 className="m-0 mt-2 text-[1.9rem] font-semibold tracking-[-0.05em] text-slate-950">
              Custom Widget
            </h1>
            <p className="m-0 mt-2 max-w-3xl text-[14px] leading-6 text-slate-500">
              A custom widget canvas built on `tldraw`, letting users compose
              text, images, shapes, lines, and server-driven placeholder modules
              into reusable content blocks.
            </p>
          </div>

          <div className="rounded-[18px] border border-white/70 bg-white/80 px-4 py-3 text-[12px] leading-6 text-slate-500 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
            <div>Core interactions come from tldraw.</div>
            <div>Export is a business schema, not raw editor JSON.</div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid min-h-[calc(100vh-116px)] max-w-[1800px] grid-cols-[minmax(0,1fr)_360px] gap-4 px-4 py-4">
        <section className="relative overflow-hidden rounded-[32px] border border-white/70 bg-[#f4efe9] shadow-[0_30px_80px_rgba(15,23,42,0.14)]">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              if (editor) {
                void handleInsertImage(editor, event);
              }
            }}
          />

          <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />

          <div className="relative h-[calc(100vh-148px)] min-h-[720px]">
            <Tldraw
              autoFocus
              hideUi
              initialState="select"
              shapeUtils={proposalShapeUtils}
              onMount={(editor) => {
                editor.setCurrentTool('select');
                setEditor(editor);
              }}
            >
              <ProposalEditorHud
                fileInputRef={fileInputRef}
                onExport={setExportedJson}
                onExportSvg={(payload) => {
                  setExportedSvg(payload);
                  setPreviewMode('svg');
                }}
              />
            </Tldraw>
          </div>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white/88 shadow-[0_22px_56px_rgba(15,23,42,0.12)]">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Export Preview
                </p>
                <h2 className="m-0 mt-2 text-[1.15rem] font-semibold tracking-[-0.04em] text-slate-950">
                  {previewMode === 'json' ? 'Proposal Document Schema' : 'Canvas SVG Export'}
                </h2>
                <p className="m-0 mt-2 text-[13px] leading-6 text-slate-500">
                  {previewMode === 'json'
                    ? 'This is the JSON payload that should be handed to the PDF service instead of raw `tldraw` snapshots.'
                    : 'This SVG is exported from the current canvas selection scope and can be downloaded directly.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewMode('json')}
                  className={`rounded-[12px] border px-3 py-2 text-[12px] font-semibold transition ${
                    previewMode === 'json'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  JSON
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('svg')}
                  className={`rounded-[12px] border px-3 py-2 text-[12px] font-semibold transition ${
                    previewMode === 'svg'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  SVG
                </button>
              </div>
            </div>
          </div>
          {previewMode === 'json' ? (
            <pre className="m-0 h-[calc(100vh-276px)] min-h-[420px] overflow-auto bg-slate-950 px-5 py-4 text-[12px] leading-6 text-slate-100">
              {exportedJson || '// Use “Export JSON” after placing some items on the canvas.'}
            </pre>
          ) : (
            <div className="h-[calc(100vh-276px)] min-h-[420px] overflow-auto bg-slate-950 p-5">
              {exportedSvg ? (
                <div className="space-y-4">
                  <div className="rounded-[20px] bg-white p-4">
                    <div
                      className="overflow-auto"
                      dangerouslySetInnerHTML={{ __html: exportedSvg }}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const blob = new Blob([exportedSvg], { type: 'image/svg+xml' });
                        const url = URL.createObjectURL(blob);
                        const anchor = document.createElement('a');
                        anchor.href = url;
                        anchor.download = 'proposal-canvas.svg';
                        anchor.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-700 transition hover:border-slate-300"
                    >
                      Download SVG
                    </button>
                  </div>
                  <pre className="m-0 overflow-auto rounded-[18px] bg-slate-900 px-4 py-4 text-[11px] leading-6 text-slate-200">
                    {exportedSvg}
                  </pre>
                </div>
              ) : (
                <div className="rounded-[20px] border border-dashed border-slate-700 px-4 py-5 text-[13px] leading-6 text-slate-300">
                  Use “Export SVG” after placing some items on the canvas.
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
