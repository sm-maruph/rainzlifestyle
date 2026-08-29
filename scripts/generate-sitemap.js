const fs = require("fs");
const path = require("path");

const SITE_URL = "https://www.rainzlifestyle.com";
const API_BASE = (
  process.env.REACT_APP_API_BASE_URL ||
  "https://raizlifestyle-backend-1.onrender.com/api"
).replace(/\/$/, "");

const staticPaths = [
  "/",
  "/new-arrivals",
  "/sale",
  "/about-us",
  "/contact-us",
  "/stores",
  "/track-order",
];

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function segment(value) {
  return encodeURIComponent(value).replace(/%2F/gi, "%252F");
}

async function getJson(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(60000),
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

async function getDynamicPaths() {
  const paths = [];
  const categories = await getJson(`${API_BASE}/categories`);

  for (const category of Array.isArray(categories) ? categories : categories.items || []) {
    if (!category.slug) continue;
    paths.push(`/${segment(category.slug)}`);
    for (const group of category.groups || category.category_groups || []) {
      for (const subcategory of group.subcategories || []) {
        if (subcategory.slug) {
          paths.push(`/${segment(category.slug)}/${segment(subcategory.slug)}`);
        }
      }
    }
  }

  const pageSize = 500;
  let page = 1;
  let total = Infinity;
  while ((page - 1) * pageSize < total) {
    const data = await getJson(
      `${API_BASE}/products?page=${page}&pageSize=${pageSize}&sort=newest`
    );
    const products = data.items || [];
    total = Number(data.total || products.length);
    for (const product of products) {
      if (product.slug) paths.push(`/product/${segment(product.slug)}`);
    }
    if (!products.length) break;
    page += 1;
  }

  return paths;
}

async function main() {
  let dynamicPaths = [];
  try {
    dynamicPaths = await getDynamicPaths();
  } catch (error) {
    console.warn(`Could not fetch dynamic sitemap URLs: ${error.message}`);
  }

  const paths = [...new Set([...staticPaths, ...dynamicPaths])];
  const urls = paths
    .map((pathname) => `  <url>\n    <loc>${escapeXml(SITE_URL + pathname)}</loc>\n  </url>`)
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  const output = path.join(__dirname, "..", "public", "sitemap.xml");
  fs.writeFileSync(output, xml, "utf8");
  console.log(`Generated sitemap.xml with ${paths.length} URLs.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
