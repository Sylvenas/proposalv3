import {
  renderPlaintextFromRichText,
  type Editor,
  type TLGeoShape,
  type TLImageShape,
  type TLLineShape,
} from 'tldraw';

import type { ProposalModuleShape, ProposalTextShape } from './shapes';

export interface ProposalDocumentSchema {
  version: '1.0';
  canvas: {
    mode: 'infinite';
  };
  elements: ProposalElementSchema[];
}

export type ProposalElementSchema =
  | ProposalTextElementSchema
  | ProposalImageElementSchema
  | ProposalRectangleElementSchema
  | ProposalLineElementSchema
  | ProposalModuleElementSchema;

interface ProposalBaseElementSchema {
  id: string;
  type: 'text' | 'image' | 'rectangle' | 'line' | 'module';
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
  zIndex: number;
}

export interface ProposalTextElementSchema extends ProposalBaseElementSchema {
  type: 'text';
  text: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  textAlign: 'left' | 'center' | 'right';
}

export interface ProposalImageElementSchema extends ProposalBaseElementSchema {
  type: 'image';
  src: string;
  assetId: string | null;
  altText: string;
}

export interface ProposalRectangleElementSchema extends ProposalBaseElementSchema {
  type: 'rectangle';
  color: string;
  dash: string;
  fill: string;
  size: string;
  opacity: number;
}

export interface ProposalLineElementSchema extends ProposalBaseElementSchema {
  type: 'line';
  color: string;
  dash: string;
  size: string;
  opacity: number;
  spline: string;
  points: Array<{
    x: number;
    y: number;
  }>;
}

export interface ProposalModuleElementSchema extends ProposalBaseElementSchema {
  type: 'module';
  moduleType: string;
  moduleKey: string;
  label: string;
  description: string;
  accent: string;
}

export function exportProposalDocument(editor: Editor): ProposalDocumentSchema {
  const shapes = editor.getCurrentPageShapesSorted() as any[];
  const elements = shapes
    .map((shape, index) => serializeShape(editor, shape, index))
    .filter(Boolean) as ProposalElementSchema[];

  return {
    version: '1.0',
    canvas: {
      mode: 'infinite',
    },
    elements,
  };
}

function serializeShape(editor: Editor, shape: any, zIndex: number) {
  if (shape.type === 'proposal-text') {
    const textShape = shape as ProposalTextShape;
    return {
      id: textShape.id,
      type: 'text' as const,
      x: textShape.x,
      y: textShape.y,
      rotation: textShape.rotation,
      width: textShape.props.w,
      height: textShape.props.h,
      zIndex,
      text: textShape.props.text,
      fontSize: textShape.props.fontSize,
      fontWeight: textShape.props.fontWeight,
      color: textShape.props.color,
      textAlign: textShape.props.textAlign,
    };
  }

  if (shape.type === 'proposal-module') {
    const moduleShape = shape as ProposalModuleShape;
    return {
      id: moduleShape.id,
      type: 'module' as const,
      x: moduleShape.x,
      y: moduleShape.y,
      rotation: moduleShape.rotation,
      width: moduleShape.props.w,
      height: moduleShape.props.h,
      zIndex,
      moduleType: moduleShape.props.moduleType,
      moduleKey: moduleShape.props.moduleKey,
      label: moduleShape.props.label,
      description: moduleShape.props.description,
      accent: moduleShape.props.accent,
    };
  }

  if (shape.type === 'image') {
    const imageShape = shape as TLImageShape;
    return {
      id: imageShape.id,
      type: 'image' as const,
      x: imageShape.x,
      y: imageShape.y,
      rotation: imageShape.rotation,
      width: imageShape.props.w,
      height: imageShape.props.h,
      zIndex,
      src: imageShape.props.url,
      assetId: imageShape.props.assetId,
      altText: imageShape.props.altText,
    };
  }

  if (shape.type === 'geo' && shape.props.geo === 'rectangle') {
    const rectangleShape = shape as TLGeoShape;
    return {
      id: rectangleShape.id,
      type: 'rectangle' as const,
      x: rectangleShape.x,
      y: rectangleShape.y,
      rotation: rectangleShape.rotation,
      width: rectangleShape.props.w,
      height: rectangleShape.props.h,
      zIndex,
      color: rectangleShape.props.color,
      dash: rectangleShape.props.dash,
      fill: rectangleShape.props.fill,
      size: rectangleShape.props.size,
      opacity: rectangleShape.opacity,
    };
  }

  if (shape.type === 'line') {
    const lineShape = shape as TLLineShape;
    const bounds = editor.getShapePageBounds(lineShape.id);
    return {
      id: lineShape.id,
      type: 'line' as const,
      x: lineShape.x,
      y: lineShape.y,
      rotation: lineShape.rotation,
      width: bounds?.w ?? 0,
      height: bounds?.h ?? 0,
      zIndex,
      color: lineShape.props.color,
      dash: lineShape.props.dash,
      size: lineShape.props.size,
      opacity: lineShape.opacity,
      spline: lineShape.props.spline,
      points: Object.values(lineShape.props.points).map((point) => ({
        x: point.x,
        y: point.y,
      })),
    };
  }

  if (shape.type === 'text') {
    return {
      id: shape.id,
      type: 'text' as const,
      x: shape.x,
      y: shape.y,
      rotation: shape.rotation,
      width: shape.props.w,
      height: shape.props.h,
      zIndex,
      text: renderPlaintextFromRichText(editor, shape.props.richText),
      fontSize: 28,
      fontWeight: '400',
      color: '#172033',
      textAlign: 'left' as const,
    };
  }

  return null;
}
