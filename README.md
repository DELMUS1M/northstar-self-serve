# Northstar Self-Serve

A lightweight support-deflection MVP for Northstar Retail Co. Lets customers self-serve on the three most common ticket types — no backend, no build step, no dependencies.

## Features

- **Order Status** — look up an order and see status, carrier, ETA, and a visual progress tracker.
- **Returns & Refunds** — check eligibility, start a return, request a shipping label, or check refund status.
- **Stock Availability** — search a product and see per-size stock, with a "notify me" action for out-of-stock sizes.

## Run it

No build step required — it's plain HTML/CSS/JS.

```bash
# from the repo root
python3 -m http.server 8000
# then open http://localhost:8000
```

Or just open `index.html` directly in a browser.

## Try it

- Order Status / Returns: `NS-10234`, `NS-10298`, `NS-10310`
- Stock: `Trail Runner Jacket`, `Canvas Tote`, `Everyday Sneaker`

## Project structure

```
index.html   — markup for all 3 panels
style.css    — all styling, responsive down to 375px
app.js       — mock data + lookup/action logic
```

## Known limitations (pre-production)

- Data is mocked and hardcoded — no live order-management integration.
- "Notify me" and "Get shipping label" are stubbed confirmations, not real emails.
- No authentication — anyone with an order number can view its status. Add an email/zip check before shipping to production.

## Extending

Swap the `orders`, `returns`, and `stock` objects in `app.js` for real API calls — the UI functions (`lookupOrder`, `lookupReturn`, `lookupStock`) are already written to consume that same shape, so the rest of the app shouldn't need to change.
