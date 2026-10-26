# Growth Edit product-link check

Checked on October 26, 2026. All 34 catalog purchase links were followed, including affiliate redirects; actual retailer product content was then checked against each recommendation. Results cards, the Starter Pair and the paid curated shelf use this shared catalog.

## Two broken links replaced

| Product | Previous ShopMy link | Problem | Verified replacement |
| --- | --- | --- | --- |
| It's a 10 Miracle Leave-In Conditioner Plus Keratin | https://go.shopmy.us/p-67238901 | Ulta destination returned a missing-page response; its product page also showed a missing-page message through the content fetch. | https://itsa10haircare.com/products/miracle-leave-in-plus-keratin |
| Bio Ionic 10X UltraLight Speed Dryer | https://go.shopmy.us/p-85121009 | Partnercentric affiliate redirect returned 404 instead of continuing to the working brand product page. | https://bioionic.com/products/10x-ultra-light-speed-dryer |

These two replacements are direct brand links, not ShopMy commission links. Replace them only with new, owner-generated ShopMy URLs whose complete redirect chain has been verified. The original URLs above are retained for reference, not used as fallback purchase links.

Both replacement pages returned HTTP 200, matched the recommended products and exposed available variants in their public Shopify product data at the time checked. Availability can change.

## Affiliate links preserved

The other 32 ShopMy links were retained. Their targets comprise 29 matching Sephora product pages, the Davines REPLUMPING leave-in, the Jolie showerhead at Ulta, and the Bio Ionic 10X Pro Styling Iron 1-inch at FragranceNet.

The FragranceNet affiliate link initially returned an automated security check, but a separate content fetch of the original ShopMy link reached the correct product page. It was not replaced solely because of that automated challenge.

Sephora affiliate gateways returned HTTP 200 with a JavaScript destination rather than an ordinary final redirect. Their encoded target URLs were decoded and the 29 actual product-page headings/content were checked separately. A successful gateway response alone was not treated as proof of a working product page.

No recommendation logic, checkout, pricing, access controls or payment setup changed. External retailer availability and region-specific behavior are not guaranteed by this point-in-time check.
