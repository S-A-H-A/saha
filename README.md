# IndiaVisa Track

100% free, zero-build static web application (`index.html`, `styles.css`, `app.js`) designed for direct GitHub Pages hosting (including custom domains like `saha.com.bd` via `CNAME`), with an optional $0 Cloudflare Worker proxy (`cloudflare-worker.js`) or Express server (`server.ts`).

## 100% Free Hosting on GitHub Pages (Zero Cost)

1. Push this repository to GitHub (`main` branch).
2. Open **Settings → Pages → Build and deployment → Source**.
3. Select **Deploy from a branch** → **`main`** → **`/ (root)`** and click **Save** (or select **GitHub Actions**).
4. Works immediately at $0 cost: validates your 12-character Application ID & IVAC Center, provides 1-click credential copy + direct official portal links, and builds bilingual EN/বাংলা status reports & 1200×675 PNG cards directly in the browser.

## Optional: 100% Free Live Dual-Portal Automation (Cloudflare Worker — $0/month)

GitHub Pages is a static server (`POST` requests to `/api/*` are not supported there). To fetch live statuses directly inside your GitHub Pages domain (`https://saha.com.bd`) at **$0 cost forever** (100,000 requests/day, no credit card):

1. Open [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages → Create Worker**.
2. Open **Settings → Setup Free Worker ($0)** inside IndiaVisa Track and click **Copy cloudflare-worker.js** (or copy `cloudflare-worker.js` from this repository).
3. Paste, click **Deploy**, copy your `https://*.workers.dev` URL, and save it under **Settings → Free Live Backend / Cloudflare Worker → Save & Test**.
