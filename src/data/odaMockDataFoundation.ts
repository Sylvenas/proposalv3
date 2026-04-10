export type ODAItem = {
  id: string
  name: string
  spec: string
  price: number
  productImages?: string[]
  swatches?: string[]
  selectedSwatch?: number
  swatchPrices?: number[]
  swatchProductImages?: string[][]
  isAddon?: boolean
  selected?: boolean
  previewImage?: string
  addonSwatches?: string[]
  selectedAddonSwatch?: number
  addonSwatchPrices?: number[]
}

export type ODASection = {
  name: string
  items: ODAItem[]
  collapsed?: boolean
}

export type ODAOption = {
  id: number
  title: string
  subtitle: string
  materials: string[]
  deliveryDays: number
  priceFrom: number
  monthlyPayment: number
  images: string[]
  sections: ODASection[]
}

// Base scope thumbnail (reuse stone texture placeholder)
export const THUMB_BASE_SCOPE = '/assets/thumb-base-scope.jpg'

// Placeholder images for foundation repair
const FOUND_IMG_1 = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80'
const FOUND_IMG_2 = 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80'
const FOUND_IMG_3 = 'https://images.unsplash.com/photo-1590644365607-1c5a13e0e3d2?w=800&q=80'
const FOUND_IMG_4 = 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80'

export const odaOptions: ODAOption[] = [
  {
    id: 1,
    title: 'OPTION 1 - CABLE LOCK™ ST PLUS',
    subtitle: 'Lifetime Transferable Service Warranty / Foundation Pilings',
    materials: ['Steel Push Piers / Angle Iron / Concrete'],
    deliveryDays: 3,
    priceFrom: 12500,
    monthlyPayment: 150,
    images: [FOUND_IMG_1, FOUND_IMG_2, FOUND_IMG_3, FOUND_IMG_4],
    sections: [
      {
        name: 'Foundation Pilings',
        items: [
          {
            id: 'fp-1',
            name: 'Cable Lock™ ST Plus Piers',
            spec: 'Galvanized Steel Push Piers — Driven to Load-Bearing Strata',
            price: 10900,
          },
        ],
      },
      {
        name: 'Upgrades',
        items: [
          {
            id: 'u-1',
            name: 'Additional Support / Angle Iron',
            spec: 'Supplemental steel angle iron bracing for compromised sections',
            price: 400,
            isAddon: true,
            selected: false,
          },
          {
            id: 'u-2',
            name: 'Tunneling (5 ft)',
            spec: 'Below-grade tunneling access for interior pier placement',
            price: 1125,
            isAddon: true,
            selected: false,
          },
          {
            id: 'u-3',
            name: 'Generator Rental',
            spec: 'On-site portable generator for locations without power access',
            price: 75,
            isAddon: true,
            selected: false,
          },
        ],
      },
    ],
  },
  {
    id: 2,
    title: 'OPTION 2 - URETHANE INJECTIONS',
    subtitle: 'Poly-3 Soil Injection / Soil Stabilization',
    materials: ['Polyurethane Foam / Injection Ports / Surface Seal'],
    deliveryDays: 1,
    priceFrom: 12500,
    monthlyPayment: 150,
    images: [FOUND_IMG_2, FOUND_IMG_3, FOUND_IMG_4, FOUND_IMG_1],
    sections: [
      {
        name: 'Soil Stabilization',
        items: [
          {
            id: 'ss-1',
            name: 'Poly-3 Urethane Soil Injection',
            spec: 'High-density polyurethane foam injection for soil compaction and lift',
            price: 11450,
          },
        ],
      },
      {
        name: 'Upgrades',
        items: [
          {
            id: 'u-4',
            name: 'Mobilization Fee',
            spec: 'Equipment transport and project setup for injection rig',
            price: 500,
            isAddon: true,
            selected: false,
          },
          {
            id: 'u-5',
            name: 'Surface Sealing',
            spec: 'Injection port sealing and surface restoration after treatment',
            price: 250,
            isAddon: true,
            selected: false,
          },
          {
            id: 'u-6',
            name: 'Expansion Joint Sealing',
            spec: 'Flexible sealant application at expansion joints to prevent moisture intrusion',
            price: 300,
            isAddon: true,
            selected: false,
          },
        ],
      },
    ],
  },
]

export const odaProjectInfo = {
  clientName: 'Mila Thompson',
  projectAddress: '456 Maple Lane, Overland Park, KS 66212',
  projectName: 'Thompson Residence',
  projectLabel: 'Foundation Stabilization - Thompson Residence',
  preparedBy: 'Tim Rice, Foundation Specialist',
  company: 'Bosterra, Inc.',
  companyAddress: '1 Main St, Boston, MA 02135',
  phone: '617-867-5309',
  email: 'tim@bosterra.com',
  emailImage: '/assets/email-image.png',
  heroImage: '/assets/hero-image.png',
}
