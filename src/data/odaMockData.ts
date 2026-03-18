export type ODAItem = {
  id: string
  name: string
  spec: string
  price: number
  // swatches: image URLs (64x64 material photos), used for standard items
  swatches?: string[]
  selectedSwatch?: number
  swatchPrices?: number[]       // parallel to swatches[], absolute price per swatch
  // add-on: optional upgrades, shown in bordered card with checkbox
  isAddon?: boolean
  selected?: boolean
  previewImage?: string  // single preview photo for add-on items
  // add-on can also have swatches (e.g. Island Countertop)
  addonSwatches?: string[]
  selectedAddonSwatch?: number
  addonSwatchPrices?: number[]  // parallel to addonSwatches[], absolute price per swatch
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

// ─── Swatch image assets (local, downloaded from Figma CDN 2026-03-18) ──────────
// Flooring swatches
const SW_FLOOR_1 = '/assets/sw-floor-1.jpg'
const SW_FLOOR_2 = '/assets/sw-floor-2.png'
const SW_FLOOR_3 = '/assets/sw-floor-3.png'
// Wall swatches
const SW_WALL_1 = '/assets/sw-wall-1.png'
const SW_WALL_2 = '/assets/sw-wall-2.png'
const SW_WALL_3 = '/assets/sw-wall-3.jpg'
const SW_WALL_4 = '/assets/sw-wall-4.jpg'
// Kitchen add-on preview images
const PV_WINE = '/assets/pv-wine.png'
const PV_FAUCET = '/assets/pv-faucet.png'
const PV_LIGHT = '/assets/pv-light.png'
// Island countertop swatches (add-on with swatches)
const SW_ISLAND_1 = '/assets/sw-island-1.png'
const SW_ISLAND_2 = '/assets/sw-island-2.jpg'
const SW_ISLAND_3 = '/assets/sw-island-3.jpg'
// Vanity swatches
const SW_VANITY_1 = '/assets/sw-vanity-1.jpg'
const SW_VANITY_2 = '/assets/sw-vanity-2.png'
const SW_VANITY_3 = '/assets/sw-vanity-3.png'
const SW_VANITY_4 = '/assets/sw-vanity-4.png'
// Bathroom add-on previews
const PV_JACUZZI = '/assets/pv-jacuzzi.png'
const PV_SHOWER = '/assets/pv-shower.jpg'
const PV_HEATED = '/assets/pv-heated.png'

// Base scope thumbnail (stone texture, used for all base scope line items)
export const THUMB_BASE_SCOPE = '/assets/thumb-base-scope.jpg'

// ─── Room photo assets (local, downloaded from Figma CDN) ────────────────────
const ROOM_IMG_1 = '/assets/room-img-1.png'
const ROOM_IMG_2 = '/assets/room-img-2.png'
const ROOM_IMG_3 = '/assets/room-img-3.png'
const ROOM_IMG_4 = '/assets/room-img-4.png'
const ROOM_IMG_5 = '/assets/room-img-5.png'
const ROOM_IMG_6 = '/assets/room-img-6.png'
const ROOM_IMG_7 = '/assets/room-img-7.png'
const ROOM_IMG_8 = '/assets/room-img-8.png'
// Fallback Unsplash rooms for options 2 & 3
const ROOM_A = 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80'
const ROOM_B = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'
const ROOM_C = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80'
const ROOM_D = 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80'
const ROOM_E = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80'
const ROOM_F = 'https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=800&q=80'
const ROOM_G = 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80'
const ROOM_H = 'https://images.unsplash.com/photo-1600566753151-384129cf4d3a?w=800&q=80'
const ROOM_K = 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800&q=80'

// ─── Fallback Unsplash swatches for options 2 & 3 ────────────────────────────
const SW_CONCRETE = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80'
const SW_WHITE = 'https://images.unsplash.com/photo-1596263544728-ea2c61efbd04?w=200&q=80'
const SW_GREY = 'https://images.unsplash.com/photo-1585421514284-efb74320d20b?w=200&q=80'
const SW_MARBLE = 'https://images.unsplash.com/photo-1604147706283-d7119b5b822c?w=200&q=80'
const SW_WALNUT = 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=200&q=80'
const SW_GLASS = 'https://images.unsplash.com/photo-1561793548-a73ced3f27c7?w=200&q=80'
// Fallback add-on previews
const PV_AUTOMATE = ROOM_F
const PV_STEAM = ROOM_A
const PV_OUTDOOR = ROOM_K

export const odaOptions: ODAOption[] = [
  {
    id: 1,
    title: 'OPTION 1 - THE TIME LESS ORIGINAL',
    subtitle: 'Modern Eclecticism, Balancing Comfort and Refinement.',
    materials: ['Oak Flooring / Brass Trim / Linen'],
    deliveryDays: 120,
    priceFrom: 250000,
    monthlyPayment: 3963,
    images: [ROOM_IMG_1, ROOM_IMG_2, ROOM_IMG_3, ROOM_IMG_4, ROOM_IMG_5, ROOM_IMG_6, ROOM_IMG_7, ROOM_IMG_8, ROOM_IMG_1],
    sections: [
      {
        name: 'Interior Finishes',
        items: [
          {
            id: 'if-1',
            name: 'Flooring',
            spec: 'Oak Wood - 600x100mm - Herringbone Pattern',
            price: 0,
            swatches: [SW_FLOOR_1, SW_FLOOR_2, SW_FLOOR_3],
            selectedSwatch: 0,
            swatchPrices: [0, 3500, 5200],
          },
          {
            id: 'if-2',
            name: 'Walls',
            spec: 'Decorative Plaster Wall Finish - White',
            price: 11000,
            swatches: [SW_WALL_1, SW_WALL_2, SW_WALL_3, SW_WALL_4],
            selectedSwatch: 1,
            swatchPrices: [8000, 11000, 13500, 18000],
          },
        ],
      },
      {
        name: 'Kitchen',
        items: [
          {
            id: 'k-1',
            name: 'Wine Refrigerator',
            spec: 'Liebherr WKb 4612 Barrique Wine Cabinet (195 bottles, Glass Door)',
            price: 11000,
            isAddon: true,
            selected: true,
            previewImage: PV_WINE,
          },
          {
            id: 'k-2',
            name: 'Pot Filler Faucet – Wall-Mounted Over Range',
            spec: 'ELKAY LKAV4091LS Kitchen Faucet',
            price: 760,
            isAddon: true,
            selected: false,
            previewImage: PV_FAUCET,
          },
          {
            id: 'k-3',
            name: 'Ambient Lighting',
            spec: 'Under-Cabinet LED Lighting',
            price: 2100,
            isAddon: true,
            selected: false,
            previewImage: PV_LIGHT,
          },
          {
            id: 'k-4',
            name: 'Island Countertop',
            spec: 'Extended Stone Edge',
            price: 11700,
            isAddon: true,
            selected: true,
            addonSwatches: [SW_ISLAND_1, SW_ISLAND_2, SW_ISLAND_3],
            selectedAddonSwatch: 0,
            addonSwatchPrices: [11700, 14200, 9800],
          },
        ],
      },
      {
        name: 'Bathroom',
        items: [
          {
            id: 'b-1',
            name: 'Vanity',
            spec: 'Floating Custom Teak Wood Design',
            price: 10500,
            swatches: [SW_VANITY_1, SW_VANITY_2, SW_VANITY_3, SW_VANITY_4],
            selectedSwatch: 0,
            swatchPrices: [10500, 12000, 8500, 15000],
          },
          {
            id: 'b-2',
            name: 'Jacuzzi Tub',
            spec: 'Royal Infinity J-480 (seats 7-8)',
            price: 9800,
            isAddon: true,
            selected: true,
            previewImage: PV_JACUZZI,
          },
          {
            id: 'b-3',
            name: 'Rainfall Shower Head',
            spec: 'Kohler Moxie Showerhead with Wireless Speaker',
            price: 630,
            isAddon: true,
            selected: false,
            previewImage: PV_SHOWER,
          },
          {
            id: 'b-4',
            name: 'Heated Floors',
            spec: 'Nuheat Cable System',
            price: 1950,
            isAddon: true,
            selected: false,
            previewImage: PV_HEATED,
          },
        ],
      },
    ],
  },
  {
    id: 2,
    title: 'OPTION 2 - CONTEMPORARY LIVING',
    subtitle: 'Clean lines and modern materials. Minimalism without sacrifice.',
    materials: ['Concrete Floors / Chrome Accents / Wool'],
    deliveryDays: 110,
    priceFrom: 310000,
    monthlyPayment: 4890,
    images: [ROOM_B, ROOM_A, ROOM_C, ROOM_D, ROOM_E, ROOM_F, ROOM_G, ROOM_H, ROOM_K],
    sections: [
      {
        name: 'Interior Finishes',
        items: [
          {
            id: 'if-1',
            name: 'Flooring',
            spec: 'Polished Concrete - Diamond Polish / Radiant Heat Ready',
            price: 0,
            swatches: [SW_CONCRETE, SW_GREY, SW_WHITE],
            selectedSwatch: 0,
            swatchPrices: [0, 4200, 6500],
          },
          {
            id: 'if-2',
            name: 'Walls',
            spec: 'Micro-Cement Seamless Wall System',
            price: 18000,
            swatches: [SW_WHITE, SW_GREY, SW_MARBLE],
            selectedSwatch: 0,
            swatchPrices: [18000, 14500, 22000],
          },
        ],
      },
      {
        name: 'Kitchen',
        items: [
          {
            id: 'k-1',
            name: 'Integrated Appliance Suite',
            spec: 'Gaggenau / Fully Integrated / Panel-Ready',
            price: 52000,
            isAddon: true,
            selected: true,
            previewImage: ROOM_K,
          },
          {
            id: 'k-2',
            name: 'Home Automation System',
            spec: 'Control4 / Full AV / Security Integration',
            price: 22000,
            isAddon: true,
            selected: false,
            previewImage: PV_AUTOMATE,
          },
          {
            id: 'k-3',
            name: 'Island Countertop',
            spec: 'Quartz Waterfall Edge - Silestone Eternal',
            price: 19500,
            isAddon: true,
            selected: true,
            addonSwatches: [SW_WHITE, SW_MARBLE, SW_GREY],
            selectedAddonSwatch: 0,
            addonSwatchPrices: [19500, 24000, 16800],
          },
        ],
      },
      {
        name: 'Bathroom',
        items: [
          {
            id: 'b-1',
            name: 'Vanity',
            spec: 'Floating Lacquer Cabinet - Custom Handle',
            price: 12500,
            swatches: [SW_WHITE, SW_GREY, SW_WALNUT, SW_GLASS],
            selectedSwatch: 0,
            swatchPrices: [12500, 10800, 14200, 16500],
          },
          {
            id: 'b-2',
            name: 'Steam Shower',
            spec: 'Mr Steam / Custom Glass Enclosure / Teak Bench',
            price: 11400,
            isAddon: true,
            selected: true,
            previewImage: PV_STEAM,
          },
          {
            id: 'b-3',
            name: 'Heated Floors',
            spec: 'Nuheat Cable System / WiFi Thermostat',
            price: 2200,
            isAddon: true,
            selected: false,
            previewImage: PV_HEATED,
          },
        ],
      },
    ],
  },
  {
    id: 3,
    title: 'OPTION 3 - PREMIUM COLLECTION',
    subtitle: 'The pinnacle of bespoke craftsmanship. Rare materials, master artisanship.',
    materials: ['Herringbone Walnut / Gold Leaf / Silk'],
    deliveryDays: 150,
    priceFrom: 420000,
    monthlyPayment: 6620,
    images: [ROOM_D, ROOM_G, ROOM_C, ROOM_A, ROOM_H, ROOM_E, ROOM_B, ROOM_F, ROOM_K],
    sections: [
      {
        name: 'Interior Finishes',
        items: [
          {
            id: 'if-1',
            name: 'Flooring',
            spec: 'Herringbone Solid Walnut - Hand-Scraped / Site-Finished',
            price: 0,
            swatches: [SW_WALNUT, SW_FLOOR_1, SW_FLOOR_3],
            selectedSwatch: 0,
            swatchPrices: [0, 7800, 12500],
          },
          {
            id: 'if-2',
            name: 'Walls',
            spec: 'Hand-Applied Venetian Plaster / Master Artisan / Gold Leaf Inlay',
            price: 32000,
            swatches: [SW_WALL_1, SW_WALL_4, SW_MARBLE],
            selectedSwatch: 0,
            swatchPrices: [32000, 28500, 42000],
          },
        ],
      },
      {
        name: 'Kitchen',
        items: [
          {
            id: 'k-1',
            name: 'La Cornue Château Range',
            spec: 'Custom Color / Pot Filler / Professional Hood',
            price: 38000,
            isAddon: true,
            selected: true,
            previewImage: ROOM_K,
          },
          {
            id: 'k-2',
            name: 'Crestron Total Home',
            spec: 'Full Automation / Cinema / Climate / Security',
            price: 45000,
            isAddon: true,
            selected: true,
            previewImage: PV_AUTOMATE,
          },
          {
            id: 'k-3',
            name: 'Island Countertop',
            spec: 'Book-Matched Statuary Marble Slab',
            price: 44000,
            isAddon: true,
            selected: false,
            addonSwatches: [SW_MARBLE, SW_WALL_2, SW_WALL_1],
            selectedAddonSwatch: 0,
            addonSwatchPrices: [44000, 38500, 52000],
          },
          {
            id: 'k-4',
            name: "Chef's Outdoor Kitchen",
            spec: 'Alfresco Grill / Pizza Oven / Bar / Pergola',
            price: 52000,
            isAddon: true,
            selected: false,
            previewImage: PV_OUTDOOR,
          },
        ],
      },
      {
        name: 'Bathroom',
        items: [
          {
            id: 'b-1',
            name: 'Vanity',
            spec: 'Bespoke Lacquered Cabinet / 12-Coat French Polish',
            price: 22000,
            swatches: [SW_WALL_1, SW_WALNUT, SW_WALL_4, SW_GLASS],
            selectedSwatch: 0,
            swatchPrices: [22000, 19500, 26000, 31000],
          },
          {
            id: 'b-2',
            name: 'Spa Suite Conversion',
            spec: 'Sauna / Steam Room / Cold Plunge / Massage Room',
            price: 62000,
            isAddon: true,
            selected: false,
            previewImage: PV_STEAM,
          },
          {
            id: 'b-3',
            name: 'Jacuzzi Tub',
            spec: 'Bain Ultra Amma Thermotherapy Edition',
            price: 18000,
            isAddon: true,
            selected: true,
            previewImage: PV_JACUZZI,
          },
          {
            id: 'b-4',
            name: 'Heated Floors',
            spec: 'Warmup DCM-PRO / All Bathrooms',
            price: 4200,
            isAddon: true,
            selected: true,
            previewImage: PV_HEATED,
          },
        ],
      },
    ],
  },
]

export const odaProjectInfo = {
  clientName: 'Junyu Zhang',
  projectAddress: '2847 Maple Grove Drive, Austin TX 78746',
  projectName: 'Maple Grove Residence',
  projectLabel: 'Home Renovation - Suite 2505, Broadway Tower',
  preparedBy: 'Sarah Chen, Principal Designer',
  company: 'ODA Architecture',
  companyAddress: '120 Walker Street, New York, NY 10013',
  phone: '+1 (212) 555-0180',
  email: 'proposals@oda-architecture.com',
  emailImage: '/assets/email-image.png',
  heroImage: '/assets/hero-image.png',
}
