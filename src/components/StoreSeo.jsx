import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import pages from "../storePages.json";
import catalog from "../seoCatalog.json";

const origin = "https://www.rainzlifestyle.com";
export default function StoreSeo() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    const path = pathname.replace(/\/+$/, "") || "/";
    const page = pages[path] || catalog[path];
    const title = page ? `${page.title} | Rainz Lifestyle` : "Rainz Lifestyle";
    document.title = title;
    const meta = (attribute, key, content) => {
      let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
      if (!element) { element = document.createElement("meta"); element.setAttribute(attribute, key); document.head.appendChild(element); }
      element.content = content;
    };
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = origin + path;
    meta("name", "description", page?.description || "Browse Rainz Lifestyle and contact our team for shopping support.");
    // Empty/future categories, utility pages and unknown URLs stay out of Search.
    // Product slugs added after a build remain eligible until the next rebuild.
    meta("name", "robots", page || /^\/product\/[^/]+$/.test(path) ? "index, follow, max-image-preview:large" : "noindex, follow");
    meta("property", "og:url", origin + path);
    meta("property", "og:title", title);
    meta("property", "og:description", page?.description || "Shop Rainz Lifestyle.");
    meta("name", "twitter:title", title);
    meta("name", "twitter:description", page?.description || "Shop Rainz Lifestyle.");
  }, [pathname]);
  return null;
}
