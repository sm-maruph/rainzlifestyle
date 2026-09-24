# Payment gateway website review

The storefront now includes footer links to Terms & Conditions, Privacy Policy,
Return & Refund Policy, About Us, Contact Us and Delivery Policy. The supplied
April 2026 SSLCommerz payment banner is served from the public folder.

Business information comes from `src/businessDetails.json`: proprietor Zamal
Uddin Ahmed, trade license TRAD/DSCC/035428/2025, and the merchant-confirmed
registered address 27/11/13-C, Topkhana Road, Shahbag, Dhaka-1000. The certificate
images, personal family information and tax certificate are not public assets.

Policies specify delivery within 5 days inside Dhaka and 10 days outside Dhaka
from confirmation; approved refunds take 7 to 10 working days after approval
and, when applicable, receipt and inspection of returned goods. Return requests
are described as prompt: no unconfirmed seven-day return-request deadline has
been introduced. Review the stated return conditions and delivery-cost policy
against actual operations before deployment.

Checkout has a blank agreement checkbox immediately before the desktop and
mobile order buttons. Each policy opens in a new tab. COD and online order APIs
both require `accepted_policies: true`; deploy the frontend and backend changes
together. No database migration is needed for these changes.

Product details show inventory quantity (and selected-size quantity), and
out-of-stock items have image overlays throughout product listings and details.
Product inventory is read from the database. No third-party ad integration was
found in storefront source; policies cover the merchant's responsibility for
third-party advertisements and sharing customer information.

The deployed store's maintenance flag was checked and was false during this
work. Keep maintenance disabled for the gateway review. SSLCommerz sandbox/live
credentials were not changed by this task; website changes do not constitute
gateway approval or enable real payments.

Validation: frontend production build, policy agreement and stock badge tests,
backend agreement validation and payment regression tests. A mobile browser
check verified the agreement starts unchecked, the order button is disabled,
and checkout has no horizontal overflow.
