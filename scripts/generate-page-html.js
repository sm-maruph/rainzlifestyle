// Give direct requests their own metadata instead of a homepage canonical.
// The hosting service must serve existing files before its SPA fallback.
const fs = require("fs");
const path = require("path");
const pages = require("../src/storePages.json");
const catalog = require("../src/seoCatalog.json");
const build = path.join(__dirname, "..", "build");
const template = fs.readFileSync(path.join(build, "index.html"), "utf8");
const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

for (const [pathname, page] of Object.entries({ ...catalog, ...pages })) {
  const url = `https://www.rainzlifestyle.com${pathname}`;
  const title = `${page.title} | Rainz Lifestyle`;
  let html = template.replace(/<title>[^<]*<\/title>/, `<title>${escape(title)}</title>`);
  for (const [attribute, key, value] of [
    ["name", "description", page.description],
    ["property", "og:title", title], ["property", "og:description", page.description],
    ["property", "og:url", url], ["name", "twitter:title", title],
    ["name", "twitter:description", page.description],
  ]) {
    html = html.replace(new RegExp(`<meta\\s+${attribute}="${key}"[^>]*>`), `<meta ${attribute}="${key}" content="${escape(value)}" />`);
  }
  html = html.replace(/<link\s+rel="canonical"[^>]*>/g, "");
  html = html.replace("</head>", `<link rel="canonical" href="${escape(url)}" /></head>`);
  // These are the same information sections rendered by StorePage, available
  // before JavaScript loads as well. React replaces them when the app mounts.
  if (page.sections) {
    const content = `<article><nav><a href="/">Home</a> / ${escape(page.title)}</nav><h1>${escape(page.title)}</h1><p>${escape(page.description)}</p>${page.sections.map(([heading, text]) => `<section><h2>${escape(heading)}</h2><p>${escape(text)}</p></section>`).join("")}<a href="/men">Shop Men</a> | <a href="/contact-us">Contact Us</a></article>`;
    html = html.replace('<div id="root"></div>', `<div id="root">${content}</div>`);
  }
  const directory = path.join(build, pathname.slice(1));
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, "index.html"), html);
}
console.log(`Generated route HTML for ${Object.keys({ ...catalog, ...pages }).length} pages.`);
