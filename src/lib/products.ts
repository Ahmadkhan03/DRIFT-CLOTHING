export type Category = "hoodies" | "tees" | "jackets";

export type Product = {
  slug: string;
  name: string;
  category: Category;
  price: number; // PKR
  compareAt?: number;
  colour: string;
  images: [string, string];
  sizes: string[];
  soldOut?: string[]; // sizes with no stock
  badge?: "New" | "Limited" | "Bestseller";
  description: string;
  details: string[];
};

export const CATEGORIES: { slug: Category; title: string; blurb: string; image: string }[] = [
  {
    slug: "hoodies",
    title: "Hoodies",
    blurb: "Heavyweight fleece, cut boxy.",
    image: img("1677538537484-324385aff147"),
  },
  {
    slug: "tees",
    title: "Tees",
    blurb: "260 GSM cotton. Built to last.",
    image: img("1618328198676-499703032285"),
  },
  {
    slug: "jackets",
    title: "Jackets",
    blurb: "Outerwear for the city.",
    image: img("1559038295-f32f4d5bb27c"),
  },
];

// Placeholder photography. Swap for real product shots later.
export function img(id: string) {
  return `https://images.unsplash.com/photo-${id}`;
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export const PRODUCTS: Product[] = [
  // Hoodies
  {
    slug: "core-hoodie-jet-black",
    name: "Core Hoodie",
    category: "hoodies",
    price: 8490,
    colour: "Jet Black",
    images: [img("1616257892423-861f4e77bd48"), img("1677538537484-324385aff147")],
    sizes: SIZES,
    soldOut: ["XS"],
    badge: "Bestseller",
    description:
      "Our signature hoodie in 480 GSM brushed-back fleece. Dropped shoulders, a double-layered hood and a boxy fit that holds its shape wash after wash.",
    details: ["480 GSM 100% cotton fleece", "Boxy, oversized fit", "Double-layered hood", "Tonal DRIFT embroidery"],
  },
  {
    slug: "oversized-hoodie-stone",
    name: "Oversized Hoodie",
    category: "hoodies",
    price: 7990,
    colour: "Stone",
    images: [img("1564557287817-3785e38ec1f5"), img("1611817757591-c3f345024273")],
    sizes: SIZES,
    badge: "New",
    description: "A relaxed, oversized hoodie in a washed stone tone. Soft hand-feel, ribbed cuffs and a kangaroo pocket.",
    details: ["420 GSM cotton fleece", "Garment washed", "Oversized fit", "Ribbed cuffs & hem"],
  },
  {
    slug: "washed-hoodie-rust",
    name: "Washed Hoodie",
    category: "hoodies",
    price: 8990,
    colour: "Rust",
    images: [img("1578768079052-aa76e52ff62e"), img("1564557287817-3785e38ec1f5")],
    sizes: SIZES,
    soldOut: ["XXL"],
    badge: "Limited",
    description: "Pigment-dyed then stone-washed for a lived-in, vintage finish. Every piece is slightly unique.",
    details: ["450 GSM cotton fleece", "Pigment dyed", "Boxy fit", "Limited run"],
  },
  {
    slug: "essential-hoodie-bone",
    name: "Essential Hoodie",
    category: "hoodies",
    price: 7490,
    colour: "Bone",
    images: [img("1615397587950-3cbb55f95b77"), img("1632682582909-2b3a2581eef7")],
    sizes: SIZES,
    description: "The everyday hoodie in a clean bone colourway. Mid-weight and easy to layer.",
    details: ["380 GSM cotton fleece", "Regular fit", "Flat drawcords", "Printed wordmark"],
  },
  {
    slug: "utility-hoodie-olive",
    name: "Utility Hoodie",
    category: "hoodies",
    price: 9490,
    colour: "Olive",
    images: [img("1565978771542-0db9ab9ad3de"), img("1614214191247-5b2d3a734f1b")],
    sizes: SIZES,
    badge: "New",
    description: "A heavyweight hoodie with a utility edge. Oversized hood and a hidden zip pocket.",
    details: ["500 GSM cotton fleece", "Hidden zip pocket", "Oversized hood", "Boxy fit"],
  },

  // Tees
  {
    slug: "essential-tee-black",
    name: "Essential Tee",
    category: "tees",
    price: 3990,
    colour: "Black",
    images: [img("1618328198676-499703032285"), img("1583743814966-8936f5b7be1a")],
    sizes: SIZES,
    badge: "Bestseller",
    description: "The foundation of every fit. Heavy 260 GSM cotton jersey in a boxy, cropped cut.",
    details: ["260 GSM 100% cotton", "Boxy, cropped fit", "Thick ribbed collar", "Pre-shrunk"],
  },
  {
    slug: "bones-graphic-tee",
    name: "Bones Graphic Tee",
    category: "tees",
    price: 4490,
    colour: "Black",
    images: [img("1503341504253-dff4815485f1"), img("1618453292507-4959ece6429e")],
    sizes: SIZES,
    badge: "New",
    description: "Screen-printed graphic on our heavyweight blank. Cracked-ink finish for a worn-in look.",
    details: ["260 GSM cotton", "Screen printed", "Oversized fit", "Cracked-ink effect"],
  },
  {
    slug: "archive-back-print-tee",
    name: "Archive Back Print Tee",
    category: "tees",
    price: 4990,
    colour: "Washed Black",
    images: [img("1523585298601-d46ae038d7d3"), img("1599423843366-d5bbbe44b4cd")],
    sizes: SIZES,
    soldOut: ["S", "M"],
    badge: "Limited",
    description: "Large archive back print with a small chest hit. Garment-washed for a faded, vintage feel.",
    details: ["260 GSM cotton", "Garment washed", "Oversized fit", "Front & back print"],
  },
  {
    slug: "boxy-tee-onyx",
    name: "Boxy Tee",
    category: "tees",
    price: 3790,
    colour: "Onyx",
    images: [img("1571455786673-9d9d6c194f90"), img("1618453292507-4959ece6429e")],
    sizes: SIZES,
    description: "Short, wide and structured. The boxy tee that sits perfectly over any pair of cargos.",
    details: ["240 GSM cotton", "Boxy fit", "Dropped shoulder", "Tonal label"],
  },

  // Jackets
  {
    slug: "moto-leather-jacket",
    name: "Moto Leather Jacket",
    category: "jackets",
    price: 18990,
    compareAt: 21990,
    colour: "Black",
    images: [img("1559038295-f32f4d5bb27c"), img("1559038217-3fb2db6186f8")],
    sizes: ["S", "M", "L", "XL"],
    badge: "Limited",
    description: "A classic moto silhouette in soft buffalo leather with matte hardware.",
    details: ["Genuine buffalo leather", "Quilted lining", "Matte black hardware", "Regular fit"],
  },
  {
    slug: "varsity-jacket-mocha",
    name: "Varsity Jacket",
    category: "jackets",
    price: 15990,
    colour: "Mocha",
    images: [img("1771310961705-c8b34eddbe9e"), img("1771310961655-b1f044b227ab")],
    sizes: ["S", "M", "L", "XL"],
    badge: "New",
    description: "Wool-blend body with contrast sleeves and chenille DRIFT patch. A modern take on the classic.",
    details: ["Wool blend body", "Snap closure", "Chenille patch", "Relaxed fit"],
  },
  {
    slug: "work-jacket-tan",
    name: "Work Jacket",
    category: "jackets",
    price: 12990,
    colour: "Tan",
    images: [img("1608976198709-5e70a09b9ff0"), img("1612029938221-a01e8c947edb")],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Heavy canvas chore jacket with a corduroy collar and four patch pockets.",
    details: ["12 oz cotton canvas", "Corduroy collar", "Four patch pockets", "Boxy fit"],
  },
  {
    slug: "zip-jacket-black",
    name: "Zip Jacket",
    category: "jackets",
    price: 11990,
    colour: "Black",
    images: [img("1586231912972-d0970f9ce787"), img("1559038267-f24e6f9698b1")],
    sizes: SIZES,
    soldOut: ["XS"],
    description: "Clean, minimal zip-through in a technical twill. Water resistant and easy to wear.",
    details: ["Technical twill", "Water resistant", "Two-way zip", "Regular fit"],
  },
];

export const EDITORIAL = {
  hero: img("1576775068668-c147f14c36f7"),
  campaignA: img("1559697242-a465f2578a95"),
  campaignB: img("1559697242-7c922c6198c6"),
  alley: img("1778871752862-c8f32e5f80b0"),
  night: img("1618842738491-7235639dfac0"),
  wall: img("1532074198010-97d0c3700b7a"),
};

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getByCategory(category: Category) {
  return PRODUCTS.filter((p) => p.category === category);
}

export function formatPrice(pkr: number) {
  return `Rs. ${pkr.toLocaleString("en-PK")}`;
}

export const FREE_SHIPPING_THRESHOLD = 10000;
