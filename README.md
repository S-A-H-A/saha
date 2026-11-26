# IndiaVisa Track

Simple static HTML/CSS/JS web application (no Vite, no frontend build step required) with an optional Node/Express backend (`server.ts`) for live Indian Visa Online & IVAC Passtrack enquiries.

## Host Directly on GitHub Pages (Zero Build Step)

Because the frontend consists of plain static files (`index.html`, `styles.css`, `app.js`, `404.html`, `.nojekyll`) at the repository root:

1. Push this repository to GitHub (`main` branch).
2. Open **Settings → Pages → Build and deployment → Source**.
3. Choose **Deploy from a branch**, select **`main`** and **`/ (root)`**, and click **Save**.
   *(Alternatively, choose **GitHub Actions** to use the included `.github/workflows/deploy-gh-pages.yml` workflow.)*

## Live Enquiries from GitHub Pages

GitHub Pages only serves static files and cannot run Node.js (`server.ts`). To run live visa enquiries directly from your GitHub Pages URL:

1. Host `server.ts` (`npm install && npm start`) on any Node host (Render, Railway, Fly.io, Cloud Run).
2. Open **Settings → Backend Server URL** in the app and paste your deployed backend URL.
