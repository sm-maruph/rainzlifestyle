
// src/api/mockApi.js
// ---------------------------------------------------------------------------
// Dummy data "API" for RAINZLIFESTYLE.
// No backend needed yet. Every function is async (returns a Promise) so you can
// later replace the body with a real fetch() call WITHOUT changing your
// components. Images are real photos pulled from LoremFlickr by keyword, and
// pinned with ?lock= so each product keeps the same image across reloads.
//
//   import { getNewArrivals, getProductBySlug, getCategories } from "../api/mockApi";
//   useEffect(() => { getNewArrivals(12).then(setProducts); }, []);
// ---------------------------------------------------------------------------
 
const BRAND = "RAINZLIFESTYLE";
 
// Real, topical image by garment keyword. lock keeps it stable.
const img = (tag, lock) => `https://loremflickr.com/600/800/${tag}?lock=${lock}`;
 
const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
 
// Tiny seeded RNG so generated prices/colors are stable between reloads.
function seeded(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
 
const SIZES = ["S", "M", "L", "XL", "XXL"];
const COLORS = [
  { name: "Black", hex: "#1f2937" },
  { name: "White", hex: "#f3f4f6" },
  { name: "Navy", hex: "#1e3a8a" },
  { name: "Olive", hex: "#4d7c0f" },
  { name: "Maroon", hex: "#7f1d1d" },
  { name: "Grey", hex: "#9ca3af" },
  { name: "Beige", hex: "#d6ccb8" },
];
const ADJECTIVES = ["Premium", "Classic", "Essential", "Signature", "Urban", "Everyday", "Heritage", "Active"];
 
// ---- Category tree (also powers the Navbar's `categories` prop) ----
export const categoryTree = [
  {
    name: "Men",
    slug: "men",
    accent: "#E11D48",
    groups: [
      { title: "Topwear", items: ["T-Shirts", "Polo Shirts", "Shirts", "Hoodies", "Jackets", "Sweatshirts"] },
      { title: "Bottomwear", items: ["Jeans", "Trousers", "Joggers", "Shorts"] },
    ],
  },
  {
    name: "Women",
    slug: "women",
    accent: "#DB2777",
    groups: [
      { title: "Western", items: ["Tops", "Dresses", "Jeans"] },
      { title: "Ethnic", items: ["Kurti", "Co-ords"] },
    ],
  },
  {
    name: "Kids",
    slug: "kids",
    accent: "#F59E0B",
    groups: [
      { title: "Boys", items: ["T-Shirts", "Shorts"] },
      { title: "Girls", items: ["Frocks", "T-Shirts"] },
    ],
  },
  {
    name: "Accessories",
    slug: "accessories",
    accent: "#0D9488",
    groups: [{ title: "All Accessories", items: ["Caps", "Belts", "Bags", "Socks"] }],
  },
];
 
// Per-subcategory image keyword + base price range [min, max]
const META = {
  "T-Shirts": { tag: "tshirt", base: [790, 1290] },
  "Polo Shirts": { tag: "poloshirt", base: [990, 1590] },
  Shirts: { tag: "shirt", base: [1190, 1990] },
  Hoodies: { tag: "hoodie", base: [1690, 2490] },
  Jackets: { tag: "jacket", base: [2490, 3990] },
  Sweatshirts: { tag: "sweater", base: [1490, 2290] },
  Jeans: { tag: "jeans", base: [1690, 2790] },
  Trousers: { tag: "trousers", base: [1290, 2190] },
  Joggers: { tag: "joggers", base: [1190, 1890] },
  Shorts: { tag: "shorts", base: [890, 1490] },
  Tops: { tag: "blouse", base: [890, 1690] },
  Dresses: { tag: "dress", base: [1690, 3290] },
  Kurti: { tag: "kurti", base: [1290, 2490] },
  "Co-ords": { tag: "fashion", base: [1990, 3490] },
  Frocks: { tag: "dress", base: [990, 1790] },
  Caps: { tag: "cap", base: [490, 890] },
  Belts: { tag: "belt", base: [590, 1190] },
  Bags: { tag: "handbag", base: [990, 2490] },
  Socks: { tag: "socks", base: [290, 590] },
};
 
// ---- Build the catalog once ----
function buildCatalog() {
  const products = [];
  let id = 1;
 
  for (const cat of categoryTree) {
    for (const group of cat.groups) {
      for (const sub of group.items) {
        const meta = META[sub] || { tag: "fashion", base: [990, 1990] };
        const perSub = 3; // products per subcategory
        for (let k = 0; k < perSub; k++) {
          const rng = seeded(id * 97 + k * 13);
          const [lo, hi] = meta.base;
          const price = Math.round((lo + rng() * (hi - lo)) / 10) * 10;
          const discounted = rng() > 0.55;
          const oldPrice = discounted ? Math.round((price / (0.7 + rng() * 0.2)) / 10) * 10 : null;
 
          const adj = ADJECTIVES[Math.floor(rng() * ADJECTIVES.length)];
          const singular = sub.replace(/s$/, "");
          const name = `${cat.name === "Kids" ? "Kids " : ""}${adj} ${singular}`;
          const lock = id * 7 + 3; // stable image
          const colorCount = 2 + Math.floor(rng() * 4);
          const colors = COLORS.slice(0, colorCount);
 
          products.push({
            id: id,
            slug: `${slugify(name)}-${id}`,
            name,
            brand: BRAND,
            category: cat.slug, // "men"
            categoryName: cat.name, // "Men"
            subcategory: slugify(sub), // "t-shirts"
            subcategoryName: sub, // "T-Shirts"
            price,
            oldPrice,
            currency: "BDT",
            rating: Math.round((3.6 + rng() * 1.4) * 10) / 10,
            reviews: Math.floor(rng() * 400) + 5,
            inStock: rng() > 0.08,
            sizes: sub === "Bags" || sub === "Caps" || sub === "Belts" ? [] : SIZES.slice(0, 4 + Math.round(rng())),
            colors,
            image: img(meta.tag, lock),
            images: [img(meta.tag, lock), img(meta.tag, lock + 1000), img(meta.tag, lock + 2000), img(meta.tag, lock + 3000)],
            description: `${name} from ${BRAND}. Crafted for everyday comfort with a clean, modern fit and durable, breathable fabric.`,
            tags: rng() > 0.6 ? ["new"] : [],
            createdAt: Date.now() - id * 86400000, // newer = lower id
          });
          id++;
        }
      }
    }
  }
  return products;
}
 
export const products = buildCatalog();
 
// ---- Helpers ----
const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));
 
function applyFilters(list, { category, subcategory, search, minPrice, maxPrice } = {}) {
  let out = list;
  if (category) out = out.filter((p) => p.category === slugify(category));
  if (subcategory) out = out.filter((p) => p.subcategory === slugify(subcategory));
  if (minPrice != null) out = out.filter((p) => p.price >= minPrice);
  if (maxPrice != null) out = out.filter((p) => p.price <= maxPrice);
  if (search) {
    const q = search.toLowerCase();
    out = out.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.subcategoryName.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q)
    );
  }
  return out;
}
 
function applySort(list, sort) {
  const out = [...list];
  switch (sort) {
    case "price-asc": return out.sort((a, b) => a.price - b.price);
    case "price-desc": return out.sort((a, b) => b.price - a.price);
    case "rating": return out.sort((a, b) => b.rating - a.rating);
    case "newest": return out.sort((a, b) => b.createdAt - a.createdAt);
    default: return out;
  }
}
 
// ---- "API" surface (swap bodies for real fetch() later) ----
 
export async function getCategories() {
  await delay(120);
  return categoryTree;
}
 
export async function getProducts(opts = {}) {
  await delay();
  const { sort, limit, page = 1, pageSize } = opts;
  let list = applySort(applyFilters(products, opts), sort);
  const total = list.length;
  if (pageSize) {
    const start = (page - 1) * pageSize;
    list = list.slice(start, start + pageSize);
  } else if (limit) {
    list = list.slice(0, limit);
  }
  return { items: list, total, page };
}
 
export async function getProductBySlug(slug) {
  await delay();
  const product = products.find((p) => p.slug === slug) || null;
  if (!product) return null;
  // a few "related" items from the same subcategory
  const related = products
    .filter((p) => p.subcategory === product.subcategory && p.id !== product.id)
    .slice(0, 4);
  return { ...product, related };
}
 
export async function getProductById(id) {
  await delay();
  return products.find((p) => p.id === Number(id)) || null;
}
 
export async function getNewArrivals(limit = 12) {
  await delay();
  return [...products].sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
}
 
export async function getFeatured(limit = 8) {
  await delay();
  return [...products].sort((a, b) => b.rating - a.rating).slice(0, limit);
}
 
export async function getByCategory(category, opts = {}) {
  return getProducts({ ...opts, category });
}
 
export async function searchProducts(query, opts = {}) {
  return getProducts({ ...opts, search: query });
}
 
export async function getBanners() {
  await delay(120);
  return [
    {
      id: "official-jersey",
      title: "Official Jersey",
      subtitle: "2026 World Cup Collection",
      image: "https://loremflickr.com/1200/520/soccer?lock=4101",
      link: "/sports/jersey",
    },
    {
      id: "fan-made-jersey",
      title: "Fan Made Jersey",
      subtitle: "Premium Edition",
      image: "https://loremflickr.com/1200/520/football?lock=4102",
      link: "/sports/fan-made-jersey",
    },
  ];
}
 
export async function getCollections() {
  await delay(150);
  const c = (id, label, tag, lock, link) => ({
    id,
    label,
    image: `https://loremflickr.com/700/700/${tag}?lock=${lock}`,
    link,
  });
  return [
    c("printed-short-sleeve", "Printed Short Sleeve", "tshirt", 4201, "/men/t-shirts"),
    c("designer-edition", "Designer Edition", "fashion", 4202, "/men/t-shirts"),
    c("short-sleeve-blanks", "Short Sleeve Blanks", "clothing", 4203, "/men/t-shirts"),
    c("drop-shoulder", "Drop Shoulder", "tshirt", 4204, "/men/t-shirts"),
    c("full-sleeve", "Full Sleeve", "shirt", 4205, "/men/sweatshirts"),
    c("womens-tshirt", "Women's T-shirt", "woman", 4206, "/women/tops"),
  ];
}
 
export default {
  getCategories,
  getBanners,
  getCollections,
  getProducts,
  getProductBySlug,
  getProductById,
  getNewArrivals,
  getFeatured,
  getByCategory,
  searchProducts,
  products,
  categoryTree,
};
 














