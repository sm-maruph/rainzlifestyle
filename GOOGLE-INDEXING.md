# Rainz Lifestyle: deployment and Google indexing

These changes are local until you deploy the frontend. Indexing happens in Google Search; Chrome is the browser used to visit the site.

## Deploy

1. Deploy this Frontend repository to your existing hosting service. The live response headers indicate Render behind Cloudflare.
2. Set the build command to `npm ci && npm run build` and the publish directory to `build` when the service root is Frontend (use `Frontend/build` if building from its parent).
3. Use Node 20 or newer. The build fetches the public product/category API to regenerate `public/sitemap.xml` and `src/seoCatalog.json`, then generates route-specific HTML in `build`. A failed API request stops the build rather than publishing a stripped sitemap.
4. Keep the React Router fallback `/*` → `/index.html` as a **Rewrite**, not a redirect. Existing route HTML, sitemap, robots.txt and assets must be served before this fallback. Render documents that existing resources take precedence: https://render.com/docs/redirects-rewrites . `static.json` alone is not a substitute for checking the Render dashboard configuration.
5. Keep `https://www.rainzlifestyle.com` as the primary domain. HTTP and non-www variants should permanently redirect there, preserving the path. Do not redirect all deep links to the homepage.
6. After deployment, open `/men`, `/about-us`, `/contact-us`, `/terms-and-conditions`, `/privacy-policy`, `/cancellation-return-policy`, `/faqs`, `/sitemap.xml` and `/robots.txt` directly. Refresh each page. In View Page Source, `/men` must have its own canonical URL, not the homepage URL. If it still receives the homepage HTML, fix the host's file routing before requesting indexing. Check that the XML URL actually returns XML, not the React shell. Clear any stale Cloudflare HTML cache if necessary.

## Submit to Google Search Console

1. Select the Domain property `rainzlifestyle.com`, or the exact URL-prefix property `https://www.rainzlifestyle.com/`. Complete verification if needed.
2. Go to **Sitemaps** and submit `https://www.rainzlifestyle.com/sitemap.xml`. Confirm a successful fetch and inspect the discovered URLs. The current sitemap contains 30 URLs, including 16 men's products. Do not resubmit the old empty-category URL list.
3. In **URL Inspection**, inspect `https://www.rainzlifestyle.com/`. Click **Test Live URL**. Check that crawling/indexing are allowed and that the rendered page displays the actual store content. Then click **Request Indexing**.
4. Repeat for `/men`, a few product URLs copied from the new sitemap, and the About/Contact pages. Product/listing content still depends on JavaScript and the public API: if the rendered test shows a loading screen, investigate API availability or maintenance mode before requesting indexing.
5. Reinspect the duplicate homepage URL after Google recrawls. Use **Validate Fix** where Search Console offers it for an issue that has actually been corrected. Do not try to make HTTP/non-www redirect URLs index separately; the HTTPS www destination is the desired indexed URL.
6. Monitor Page Indexing and URL Inspection over the following days/weeks. Repeated requests do not speed up crawling. Neither a sitemap nor an indexing request guarantees indexing or ranking.

## What the screenshots mean

- **Page with redirect:** The source URL redirects; Google should index its destination instead. Live checks on September 7, 2026 confirmed homepage variants redirect toward HTTPS www. HTTP non-www currently uses two hops.
- **Duplicate without user-selected canonical:** The screenshot reflects an older crawl of HTTP www. That address now redirects. This change also fixes the app's shared homepage canonical by providing page-specific canonicals and metadata.
- **Discovered – currently not indexed:** Google knows the URLs but has not crawled them yet. The old list contains empty categories; these have been removed from the sitemap. The screenshot alone cannot establish why Google delayed crawling the remaining pages.

## Store content and future products

- The six footer pages share content in `src/storePages.json`; contact details come from Admin Settings. Verify your support email, phone, address and hours there. The fallback email is `rainzlifestyle.official@gmail.com`, already present in the original site.
- Cancellation/return content explains how to contact support. It does not invent a return deadline, refund turnaround or who pays return postage. Add your actual business rules to the page when supplied. Review the terms/privacy text against your actual operations.
- All original categories remain visible in the main navigation, homepage category section and listing sidebar. The sitemap includes only populated men's categories and products, alongside the homepage and footer pages. Empty/future categories and utility routes receive `noindex, follow` after rendering; they remain accessible to visitors.
- Redeploy after adding/removing products or populating a men's subcategory so the sitemap and generated metadata reflect the catalog. When launching other categories, update the men filter in `scripts/generate-sitemap.js`, then rebuild. No category/product records were deleted.
- The build includes static text for the footer pages. This is not full server rendering of product/listing pages. If Google cannot reliably render those pages, prerendering or server rendering the catalog is a further improvement.

Google documentation:
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
- https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- https://support.google.com/webmasters/answer/7440203

## Product URL structure

Product URLs now follow `/category/subcategory/product-slug` for every category. For example, `/men/printed/rainz-man-s-printed-crop-beach-shirt`. The category/subcategory come from the product record, not its name. Products without a subcategory use `/category/uncategorized/product-slug` to avoid conflicting with category routes.

All storefront product links use the shared `src/productPath.js` helper. Old `/product/slug` visits resolve to the current path in the app; the production build also provides immediate HTML redirects for products in the sitemap. These are HTML redirects, not server HTTP 301 responses. For permanent HTTP redirects, add an exact old-to-new rule for each product in the hosting dashboard. Rebuild after changing category assignments to refresh sitemap entries and built redirects.
