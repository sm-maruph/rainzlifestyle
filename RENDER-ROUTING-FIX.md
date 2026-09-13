# Render routing correction

Live checks on September 12, 2026 (Asia/Dhaka) found that /men and /contact-us return homepage HTML, while /men/ returns route-specific HTML.

In Render > your frontend static site > Redirects/Rewrites, add these exact Rewrite rules ABOVE the existing /* -> /index.html fallback. Keep the fallback last. These rules serve the already-generated HTML without changing the public URLs.

| Source | Destination | Action |
| --- | --- | --- |
| /men | /men/index.html | Rewrite |
| /men/full-sleeve | /men/full-sleeve/index.html | Rewrite |
| /men/half-sleeve | /men/half-sleeve/index.html | Rewrite |
| /men/printed | /men/printed/index.html | Rewrite |
| /men/polo | /men/polo/index.html | Rewrite |
| /men/round-neck | /men/round-neck/index.html | Rewrite |
| /men/denim | /men/denim/index.html | Rewrite |
| /men/printed/rainz-man-s-printed-crop-beach-shirt | /men/printed/rainz-man-s-printed-crop-beach-shirt/index.html | Rewrite |
| /men/round-neck/s26tkts03-drop-shoulder | /men/round-neck/s26tkts03-drop-shoulder/index.html | Rewrite |
| /men/round-neck/s26tkts02-slim-fit | /men/round-neck/s26tkts02-slim-fit/index.html | Rewrite |
| /men/round-neck/s26tkts01-regular-fit | /men/round-neck/s26tkts01-regular-fit/index.html | Rewrite |
| /men/round-neck/100-cotton-s-j-150-gsm | /men/round-neck/100-cotton-s-j-150-gsm/index.html | Rewrite |
| /men/full-sleeve/rainz-man-s-light-weight-check-shirt | /men/full-sleeve/rainz-man-s-light-weight-check-shirt/index.html | Rewrite |
| /men/round-neck/s26tkts04-slim-fit | /men/round-neck/s26tkts04-slim-fit/index.html | Rewrite |
| /men/denim/denim-gsl-01-slim-basic-slub | /men/denim/denim-gsl-01-slim-basic-slub/index.html | Rewrite |
| /men/denim/denim-gsl-01-straight-fit | /men/denim/denim-gsl-01-straight-fit/index.html | Rewrite |
| /men/denim/denim-gsl-01-slim-basic | /men/denim/denim-gsl-01-slim-basic/index.html | Rewrite |
| /men/denim/denim-gsl-02-slim-basic | /men/denim/denim-gsl-02-slim-basic/index.html | Rewrite |
| /men/polo/s26tktpl02-regular-fit | /men/polo/s26tktpl02-regular-fit/index.html | Rewrite |
| /men/polo/s26tktpl01-regular-fit | /men/polo/s26tktpl01-regular-fit/index.html | Rewrite |
| /men/printed/printed-half-shirt | /men/printed/printed-half-shirt/index.html | Rewrite |
| /men/full-sleeve/full-sleeve-shirt | /men/full-sleeve/full-sleeve-shirt/index.html | Rewrite |
| /men/half-sleeve/s26tktpl01 | /men/half-sleeve/s26tktpl01/index.html | Rewrite |
| /about-us | /about-us/index.html | Rewrite |
| /contact-us | /contact-us/index.html | Rewrite |
| /terms-and-conditions | /terms-and-conditions/index.html | Rewrite |
| /privacy-policy | /privacy-policy/index.html | Rewrite |
| /cancellation-return-policy | /cancellation-return-policy/index.html | Rewrite |
| /faqs | /faqs/index.html | Rewrite |

After saving, clear any cached HTML in Cloudflare. Check page source for /men and /contact-us: each canonical must match its own URL. Then use Search Console Test Live URL and Request Indexing for the HTTPS www homepage and important pages.

These dashboard changes have not been applied by Codex. Reference: https://render.com/docs/redirects-rewrites
