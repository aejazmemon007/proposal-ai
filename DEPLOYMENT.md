# 🚀 How to Make ProposalAI Live

ProposalAI is 100% production-ready and configured for instant deployment across any cloud or static hosting provider. Choose any method below to get your application live in minutes.

---

## ⚡ Option 1: Deploy to Vercel (Recommended — Free & Easiest)

1. Push this project folder to your GitHub / GitLab / Bitbucket repository:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit for ProposalAI"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New..."** → **"Project"**.
4. Select your imported GitHub repository.
5. Vercel will automatically detect Vite and use `vercel.json` (which is already configured).
6. Click **"Deploy"**!
   - Your live site will be immediately live with a free SSL certificate (e.g. `https://your-app.vercel.app`)
   - All SPA deep routes (e.g. `/dashboard`, `/proposals/new`, `/p/:token`) work automatically without 404 errors.

---

## ⚡ Option 2: Deploy to Netlify (Free & Drag-and-Drop / Git)

### Method A: Connect with Git
1. Go to [netlify.com](https://netlify.com) and log in.
2. Click **"Add new site"** → **"Import an existing project"**.
3. Select your GitHub repository.
4. Netlify will read `netlify.toml` automatically:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Click **"Deploy ProposalAI"**.

### Method B: Instant Manual Drag & Drop (No Git Needed)
1. Run `npm run build` locally in your terminal.
2. Open the `dist` folder in your file explorer.
3. Go to [app.netlify.com/drop](https://app.netlify.com/drop) and drag the `dist` folder into the upload box.
4. Your site is live immediately!

---

## ⚡ Option 3: Deploy to Cloudflare Pages (Free)

1. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages**.
2. Click **Create Application** → **Pages** → **Connect to Git**.
3. Select your repository.
4. Set Build Settings:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Click **Save and Deploy**. (SPA redirect rules in `public/_redirects` are already included).

---

## ⚡ Option 4: Deploy with Docker (Render / Railway / DigitalOcean / VPS)

This repository includes a multi-stage `Dockerfile` and production `nginx.conf`.

### Run locally or on a VPS:
```bash
# Build Docker image
docker build -t proposal-ai:latest .

# Run container on port 80
docker run -d -p 80:80 --name proposal-ai proposal-ai:latest
```
Open `http://localhost` or `http://<your-server-ip>` in your browser.

### Deploy on Railway or Render:
1. Connect your GitHub repository on [Railway](https://railway.app) or [Render](https://render.com).
2. Choose **"Deploy from Dockerfile"** or **"Static Site"** (Build command: `npm run build`, Publish directory: `dist`).
3. Deploy!

---

## 🛠️ Local Development & Production Preview

- **Run Dev Server:**
  ```bash
  npm run dev
  ```
  Accessible at `http://localhost:8443`

- **Build Production Bundle:**
  ```bash
  npm run build
  ```
  Outputs optimized, minified chunks into `./dist`

- **Preview Built Site Locally:**
  ```bash
  npm run preview
  ```

---

## 🔗 Live Client Proposal Sharing
- When you create a proposal and click **"Share Link"**, the URL contains a safe, self-contained payload token.
- You can send this link to **any client on any computer or mobile device**.
- Clients can view the proposal, click **"Accept Proposal"**, choose **"Download PDF"**, or leave feedback.
