export type ProposalModuleType =
  | 'placeholder-title'
  | 'placeholder-rich-block'
  | 'placeholder-contact'
  | 'placeholder-line-items';

export interface ProposalModuleDefinition {
  type: ProposalModuleType;
  label: string;
  key: string;
  description: string;
  accent: string;
  defaultSize: {
    w: number;
    h: number;
  };
}

export const PROPOSAL_MODULES: ProposalModuleDefinition[] = [
  {
    type: 'placeholder-title',
    label: 'Title Placeholder',
    key: 'proposal.title',
    description: 'Primary heading placeholder that the server can replace.',
    accent: '#eb6a2a',
    defaultSize: { w: 360, h: 116 },
  },
  {
    type: 'placeholder-rich-block',
    label: 'Rich Content Block',
    key: 'proposal.body',
    description: 'Structured content region for larger narrative sections.',
    accent: '#3b5ccc',
    defaultSize: { w: 420, h: 220 },
  },
  {
    type: 'placeholder-contact',
    label: 'Contact Summary',
    key: 'customer.contact',
    description: 'Compact contact card placeholder for recipient details.',
    accent: '#188568',
    defaultSize: { w: 300, h: 168 },
  },
  {
    type: 'placeholder-line-items',
    label: 'Line Items Table',
    key: 'proposal.line_items',
    description: 'Tabular area for server-side itemized content injection.',
    accent: '#9d4edd',
    defaultSize: { w: 480, h: 240 },
  },
];

export function getModuleDefinition(type: ProposalModuleType) {
  return PROPOSAL_MODULES.find((module) => module.type === type) ?? PROPOSAL_MODULES[0];
}
