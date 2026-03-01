# Deployment Guide

This guide explains how to deploy the AI Stock Analyzer to Vercel.

## Prerequisites

1. **GitHub account** with your repository pushed.
2. **Vercel account** (sign up at [vercel.com](https://vercel.com)).
3. **Environment variables** ready (Supabase URL & API key).

---

## Step 1: Link GitHub to Vercel

1. Go to [vercel.com/new](https://vercel.com/new).
2. Click **"Import Git Repository"**.
3. Authorize Vercel to access your GitHub account.
4. Select the `AstroAlpha` (or your repo name) repository.
5. Click **"Import"**.

---

## Step 2: Configure Project Settings

### Framework & Build

Vercel should auto-detect:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm ci`

If not auto-detected, enter the values above manually.

### Environment Variables

1. In Vercel, go to **Settings → Environment Variables**.
2. Add the following variables:

| Key | Value | Scope |
|-----|-------|-------|
| `VITE_SUPABASE_URL` | `https://your-project-id.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `your-anon-key` | Production, Preview, Development |

3. Click **Save**.

---

## Step 3: Deploy

Click **"Deploy"** to trigger the first build and deployment.

Vercel will:
1. Clone your repository
2. Install dependencies
3. Build the project
4. Deploy to a live URL

Once finished, you'll see a URL like: `https://astroalpha.vercel.app`

---

## Step 4: Set Custom Domain (Optional)

1. Go to your Vercel project → **Settings → Domains**.
2. Click **"Add Domain"**.
3. Enter your custom domain (e.g., `astroalpha.com`).
4. Follow the DNS instructions provided by Vercel.
5. Update your domain registrar's DNS settings.

---

## Automatic Deployments

With GitHub connected, deployments are **automatic**:

- **Every push to `main`** → Production deployment
- **Every push to other branches** → Preview deployment
- **Every PR** → Preview deployment with a unique URL (posted as a comment)

To disable auto-deployment: **Settings → Git → Automatic Deployments** (toggle off).

---

## GitHub Actions + Vercel Integration

The repository includes a GitHub Actions workflow (`.github/workflows/deploy-vercel.yml`) that:

1. Runs on every push to `main` or `develop`
2. Builds the project
3. Deploys to Vercel (production for `main`, preview for others)
4. Posts preview URLs on PRs

### Required Secrets for GitHub Actions

Add these to your GitHub repository under **Settings → Secrets and variables → Actions**:

| Secret | Value | Where to find |
|--------|-------|---------------|
| `VERCEL_TOKEN` | Your Vercel auth token | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Your Vercel organization ID | Vercel dashboard URL or API |
| `VERCEL_PROJECT_ID` | Your project ID | Vercel project settings or API |

To find these values:

1. **VERCEL_TOKEN**: Go to [vercel.com/account/tokens](https://vercel.com/account/tokens), create a new token, and copy it.
2. **VERCEL_ORG_ID** and **VERCEL_PROJECT_ID**: Run the Vercel CLI locally:
   ```bash
   npx vercel link
   npx vercel env pull
   ```
   Check the `.vercel/project.json` file created.

---

## Viewing Logs

### Vercel Logs
- **Production**: Go to project → **Deployments** → click on a deployment → **Logs**
- **Preview**: Similar process for preview deployments

### GitHub Actions Logs
- Go to your GitHub repo → **Actions** tab
- Click on a workflow run to see build logs and errors

---

## Rollback to Previous Version

1. Go to Vercel project → **Deployments**
2. Hover over a previous deployment
3. Click **"Promote to Production"** to rollback

---

## Troubleshooting

### Build Fails with "Command failed: npm run build"

1. Check that `npm run build` works locally: `npm run build`
2. Verify all dependencies are listed in `package.json`
3. Check for node version mismatch: ensure `engines.node` in `package.json` matches Vercel's default (currently Node 18+)

### Environment Variables Not Working

1. Verify they're added in Vercel **Settings → Environment Variables**
2. Rebuild: **Deployments** → click the "..." menu → **Redeploy**
3. Check values aren't accidentally truncated or have extra spaces

### Website Shows "404" After Deploy

1. Vercel auto-detected the wrong framework or output directory
2. Go to **Settings → Build & Development Settings** and verify:
   - **Framework Preset**: `Vite`
   - **Output Directory**: `dist`

### Supabase Connection Fails

1. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in Vercel's env vars
2. Check the browser console for errors (`Ctrl+Shift+J`)
3. Ensure your Supabase project is running and accessible from the internet

---

## Monitoring & Analytics

Once deployed, you can monitor:

- **Vercel Analytics**: **Settings → Analytics** (requires the Vercel Analytics integration)
- **Error Tracking**: Check Vercel **Deployments** logs for failures
- **Performance**: Use Chrome DevTools or tools like Lighthouse

---

## Going Live to Production

When ready to go live:

1. Ensure all features are tested on the preview deployment
2. Merge to `main` branch:
   ```bash
   git checkout main
   git pull origin main
   git merge develop
   git push origin main
   ```
3. GitHub Actions will auto-deploy to production
4. Visit your production URL to verify

---

## Useful Commands

```bash
# Link local project to Vercel (for CLI access)
npx vercel link

# Deploy locally (for testing)
npm run build && npm run preview

# Pull environment variables from Vercel
npx vercel env pull

# Check Vercel project info
npx vercel projects ls
```

---

For more details, see the [Vercel Documentation](https://vercel.com/docs).
