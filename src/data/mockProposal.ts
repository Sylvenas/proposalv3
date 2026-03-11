export type ProposalStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'PAID'
  | 'EXPIRED'
  | 'VOID'
  | 'RECALLED'
  | 'LOST'
  | 'DELETED';

export type PhaseStatus = 'unpaid' | 'paid' | 'pending';

export interface Phase {
  id: string;
  label: string;
  description: string;
  amount: number;
  percentage: number;
  status: PhaseStatus;
  paidDate?: string;
}

export interface Product {
  name: string;
  description?: string;
  quantity?: string;
  price?: number;
  imageUrl?: string;
}

export interface ProductGroup {
  categoryName: string;
  products: Product[];
}

export interface ProposalOption {
  id: string;
  name: string;
  description: string;
  total: number;
  coverImageUrl?: string;
  drawingPreviewUrl?: string;
  pdfUrl?: string;
  isRecommended?: boolean;
  productGroups: ProductGroup[];
  paymentPhases: Phase[];
  features: Array<{ label: string; included: boolean }>;
}

export interface Company {
  name: string;
  logoUrl?: string;
}

export interface Proposal {
  id: string;
  name: string;
  description?: string;
  customerName: string;
  customerAddress?: string;
  status: ProposalStatus;
  expiredTime?: string; // ISO string
  approvedOptionId?: string;
  recommendedOptionId?: string;
  salesName: string;
  salesPhone: string;
  salesEmail: string;
  company: Company;
  options: ProposalOption[];
  currencySymbol: string;
  esignRequired?: boolean;
  coverImageUrl?: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const BLUEPRINT_URL =
  'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80';
const DRAWING_URL =
  'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=800&q=80';
const SHINGLE_URL =
  'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80';
const DEMO_URL =
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80';
const GUTTER_URL =
  'https://images.unsplash.com/photo-1494526585095-c41746248156?w=800&q=80';
const SHIELD_URL =
  'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=800&q=80';
const WARRANTY_URL =
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80';

export const MOCK_PROPOSAL: Proposal = {
  id: 'prop-001',
  name: 'Roof Replacement 2025',
  description: 'Full tear-off and replacement with 3 package options — from essential protection to a complete premium upgrade with gutters.',
  customerName: 'Sarah Chen',
  customerAddress: '142 Maple Drive, Portland OR 97201',
  status: 'PENDING',
  expiredTime: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
  recommendedOptionId: 'opt-2',
  salesName: 'Marcus Johnson',
  salesPhone: '(555) 234-5678',
  salesEmail: 'marcus@greenfield.com',
  coverImageUrl: BLUEPRINT_URL,
  currencySymbol: '$',
  company: {
    name: 'Greenfield Roofing',
    logoUrl: undefined,
  },
  options: [
    {
      id: 'opt-1',
      name: 'Good',
      description: 'Essential protection at the best price point.',
      total: 14200,
      coverImageUrl: BLUEPRINT_URL,
      drawingPreviewUrl: DRAWING_URL,
      productGroups: [
        {
          categoryName: 'Full Tear-off & Disposal',
          products: [
            {
              name: 'Complete removal of existing shingles',
              description: 'Complete tear-off, haul-away, and site cleanup with disposal included.',
              quantity: '1 scope',
              price: 2900,
              imageUrl: DEMO_URL,
            },
          ],
        },
        {
          categoryName: '20-Year Architectural Shingles',
          products: [
            {
              name: 'GAF Timberline NS',
              description: 'Standard grade architectural shingles installed across the full roof area.',
              quantity: '32 squares',
              price: 9600,
              imageUrl: SHINGLE_URL,
            },
          ],
        },
        {
          categoryName: '5-Year Workmanship Warranty',
          products: [
            {
              name: 'Labor warranty',
              description: 'Covers installation defects and workmanship issues for five years.',
              quantity: '1 plan',
              price: 1700,
              imageUrl: WARRANTY_URL,
            },
          ],
        },
      ],
      paymentPhases: [
        { id: 'p1', label: 'Deposit', description: 'Due on approval', amount: 4260, percentage: 30, status: 'unpaid' },
        { id: 'p2', label: 'Mid-project', description: 'On project start', amount: 7100, percentage: 50, status: 'unpaid' },
        { id: 'p3', label: 'Completion', description: 'On project finish', amount: 2840, percentage: 20, status: 'unpaid' },
      ],
      features: [
        { label: '20-yr Shingles', included: true },
        { label: 'Full tear-off', included: true },
        { label: '5-yr warranty', included: true },
        { label: 'Gutter replace', included: false },
        { label: '30-yr warranty', included: false },
        { label: 'Ice & water shield', included: false },
      ],
    },
    {
      id: 'opt-2',
      name: 'Best Value',
      description: 'The most popular choice — premium materials with full peace of mind.',
      total: 18400,
      coverImageUrl: BLUEPRINT_URL,
      drawingPreviewUrl: DRAWING_URL,
      isRecommended: true,
      productGroups: [
        {
          categoryName: 'Full Tear-off & Disposal',
          products: [
            {
              name: 'Complete removal of existing shingles',
              description: 'Complete tear-off, haul-away, and site cleanup with disposal included.',
              quantity: '1 scope',
              price: 3200,
              imageUrl: DEMO_URL,
            },
          ],
        },
        {
          categoryName: '30-Year Architectural Shingles',
          products: [
            {
              name: 'GAF Timberline HDZ',
              description: '30-year architectural shingles with upgraded curb appeal and weather performance.',
              quantity: '32 squares',
              price: 7600,
              imageUrl: SHINGLE_URL,
            },
          ],
        },
        {
          categoryName: '10-Year Workmanship Warranty',
          products: [
            {
              name: 'Extended labor warranty',
              description: 'Extended workmanship protection covering the full installation.',
              quantity: '1 plan',
              price: 1200,
              imageUrl: WARRANTY_URL,
            },
          ],
        },
        {
          categoryName: 'Ice & Water Shield',
          products: [
            {
              name: 'Full eave and valley coverage',
              description: 'Leak protection in vulnerable roof areas including eaves and valleys.',
              quantity: '460 sq ft',
              price: 6400,
              imageUrl: SHIELD_URL,
            },
          ],
        },
      ],
      paymentPhases: [
        { id: 'p1', label: 'Deposit', description: 'Due on approval', amount: 5520, percentage: 30, status: 'unpaid' },
        { id: 'p2', label: 'Mid-project', description: 'On project start', amount: 9200, percentage: 50, status: 'unpaid' },
        { id: 'p3', label: 'Completion', description: 'On project finish', amount: 3680, percentage: 20, status: 'unpaid' },
      ],
      features: [
        { label: '30-yr Shingles', included: true },
        { label: 'Full tear-off', included: true },
        { label: '10-yr warranty', included: true },
        { label: 'Ice & water shield', included: true },
        { label: 'Gutter replace', included: false },
        { label: '15-yr warranty', included: false },
      ],
    },
    {
      id: 'opt-3',
      name: 'Premium',
      description: 'Complete renovation with lifetime protection and gutter replacement.',
      total: 24900,
      coverImageUrl: BLUEPRINT_URL,
      drawingPreviewUrl: DRAWING_URL,
      productGroups: [
        {
          categoryName: 'Full Tear-off & Disposal',
          products: [
            {
              name: 'Complete removal of existing shingles',
              description: 'Complete tear-off, haul-away, and site cleanup with disposal included.',
              quantity: '1 scope',
              price: 3400,
              imageUrl: DEMO_URL,
            },
          ],
        },
        {
          categoryName: '50-Year Designer Shingles',
          products: [
            {
              name: 'GAF Camelot II',
              description: 'Designer shingles with premium profile and lifetime limited warranty.',
              quantity: '32 squares',
              price: 9800,
              imageUrl: SHINGLE_URL,
            },
          ],
        },
        {
          categoryName: '15-Year Workmanship Warranty',
          products: [
            {
              name: 'Premium labor warranty',
              description: 'Industry-leading workmanship protection with long-term coverage.',
              quantity: '1 plan',
              price: 1600,
              imageUrl: WARRANTY_URL,
            },
          ],
        },
        {
          categoryName: 'Full Gutter Replacement',
          products: [
            {
              name: '6" seamless aluminum gutters',
              description: 'Color-matched seamless gutters installed around the full roofline.',
              quantity: '110 linear ft',
              price: 5200,
              imageUrl: GUTTER_URL,
            },
          ],
        },
        {
          categoryName: 'Ice & Water Shield',
          products: [
            {
              name: 'Full roof coverage',
              description: 'Maximum leak protection membrane across the full roof deck.',
              quantity: '1 roof system',
              price: 4900,
              imageUrl: SHIELD_URL,
            },
          ],
        },
      ],
      paymentPhases: [
        { id: 'p1', label: 'Deposit', description: 'Due on approval', amount: 7470, percentage: 30, status: 'unpaid' },
        { id: 'p2', label: 'Mid-project', description: 'On project start', amount: 12450, percentage: 50, status: 'unpaid' },
        { id: 'p3', label: 'Completion', description: 'On project finish', amount: 4980, percentage: 20, status: 'unpaid' },
      ],
      features: [
        { label: '50-yr Shingles', included: true },
        { label: 'Full tear-off', included: true },
        { label: '15-yr warranty', included: true },
        { label: 'Ice & water shield', included: true },
        { label: 'Gutter replace', included: true },
        { label: 'Designer grade', included: true },
      ],
    },
  ],
};

// Approved state variant
export const MOCK_PROPOSAL_APPROVED: Proposal = {
  ...MOCK_PROPOSAL,
  status: 'APPROVED',
  approvedOptionId: 'opt-2',
  options: MOCK_PROPOSAL.options.map(option =>
    option.id === 'opt-2'
      ? {
          ...option,
          paymentPhases: option.paymentPhases.map(phase =>
            phase.id === 'p1'
              ? {
                  ...phase,
                  status: 'paid',
                  paidDate: 'Mar 08, 2026',
                }
              : phase.id === 'p2'
                ? {
                    ...phase,
                    status: 'pending',
                  }
                : {
                    ...phase,
                    status: 'unpaid',
                  }
          ),
        }
      : option
  ),
};

// Single option variant
export const MOCK_PROPOSAL_SINGLE: Proposal = {
  ...MOCK_PROPOSAL,
  options: [MOCK_PROPOSAL.options[1]],
  recommendedOptionId: undefined,
};
