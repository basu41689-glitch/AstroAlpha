# Complete Setup Checklist

This checklist ensures your project is fully configured for development, CI/CD, and deployment.

## ✅ Local Development Setup

- [ ] Clone repository: `git clone https://github.com/basu41689-glitch/AstroAlpha.git`
- [ ] Navigate to project: `cd AstroAlpha`
- [ ] Install dependencies: `npm install`
- [ ] Copy env template: `cp .env.example .env`
- [ ] Add Supabase credentials to `.env`
- [ ] Test dev server: `npm run dev` → visit http://localhost:5173
- [ ] Test build: `npm run build` → verify `dist/` folder created
- [ ] Test preview: `npm run preview` → verify production build works

## ✅ Git & GitHub Configuration

- [ ] Verify `.github/workflows/` exists with CI and deploy workflows
- [ ] Verify `.gitignore` includes `.env` and `node_modules`
- [ ] Branches created and pushed:
  - [ ] `main` branch
  - [ ] `develop` branch
- [ ] Set `develop` as default branch (optional):
  - Go to GitHub repo → Settings → Branches → Default branch → select `develop`

## ✅ GitHub Security & Branch Protection (Do This on GitHub.com)

- [ ] **Enable branch protection for `main`**:
  - Require pull requests (1 approval)
  - Require status checks to pass
  - Require branches up to date
  - Include administrators
  
- [ ] **Enable branch protection for `develop`** (less strict):
  - Require pull requests (1 approval)
  - Require status checks to pass

- [ ] **Add GitHub Secrets** for Vercel deployment:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`
  
  (See [GITHUB_SETUP.md](GITHUB_SETUP.md) for instructions)

## ✅ GitHub Actions Workflows

- [ ] CI workflow (`.github/workflows/ci.yml`):
  - ✅ Builds project
  - ✅ Runs security audit
  - ✅ Uploads artifacts
  
- [ ] Deployment workflow (`.github/workflows/deploy-vercel.yml`):
  - ✅ Deploys to Vercel on push to `main`
  - ✅ Creates preview on PR
  - ✅ Requires `VERCEL_*` secrets

## ✅ Vercel Deployment Setup

- [ ] Create Vercel account at [vercel.com](https://vercel.com)
- [ ] Link GitHub repository to Vercel
- [ ] Configure build settings:
  - Framework: `Vite`
  - Build command: `npm run build`
  - Output directory: `dist`
- [ ] Add environment variables in Vercel dashboard:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- [ ] Trigger first deployment (auto-triggers on push to `main`)
- [ ] Verify production URL works
- [ ] (Optional) Set custom domain in Vercel

## ✅ Supabase Configuration

- [ ] Create Supabase project at [supabase.com](https://supabase.com)
- [ ] Create `users` table in SQL editor:
  ```sql
  CREATE TABLE users (
    id serial PRIMARY KEY,
    name text
  );
  ```
- [ ] Get credentials:
  - Project URL (https://xxx.supabase.co)
  - Anon/public API key
- [ ] Add to `.env` locally
- [ ] Add to Vercel environment variables
- [ ] Test connection: `npm run dev` → check browser console

## ✅ Documentation & Guidelines

- [ ] Read [CONTRIBUTING.md](CONTRIBUTING.md):
  - Understand Gitflow branching model
  - Commit message conventions
  - PR process
  
- [ ] Read [DEPLOYMENT.md](DEPLOYMENT.md):
  - Understand Vercel deployment process
  - Know how GitHub Actions integrates
  - Understand preview vs production
  
- [ ] Read [GITHUB_SETUP.md](GITHUB_SETUP.md):
  - Know how to set branch protection rules
  - Know how to manage secrets
  
- [ ] Read [QUICK_REFERENCE.md](QUICK_REFERENCE.md):
  - Bookmark for common commands
  - Reference for troubleshooting

## ✅ First Contribution (Test the Workflow)

1. **Create feature branch**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/test-workflow
   ```

2. **Make a test change** (e.g., add a comment to App.jsx)

3. **Commit and push**:
   ```bash
   git add .
   git commit -m "test: verify workflow setup"
   git push origin feature/test-workflow
   ```

4. **Open PR on GitHub to `develop`**:
   - Watch GitHub Actions run automatically
   - Verify build passes
   - Verify preview deployment created
   - Get it approved
   - Merge

5. **Verify on `develop`**:
   - CI checks still pass
   - Preview deploys automatically

6. **Create release PR** (`develop` → `main`):
   - Open PR from `develop` to `main`
   - Watch CI run again
   - Merge to `main`
   - Verify production deployment to Vercel

## ✅ Team Collaboration Setup (Optional)

- [ ] Add team members as collaborators:
  - GitHub repo → Settings → Collaborators
  
- [ ] Create `.github/CODEOWNERS` file (optional):
  - Automatically request reviews from code owners
  
- [ ] Set up notifications:
  - GitHub: Customize notification preferences
  - Slack/Discord: Add webhook for deployments (optional)

## ✅ Monitoring & Maintenance

- [ ] Set up regular checks:
  - [ ] Review GitHub Actions logs weekly
  - [ ] Check Vercel deployments for errors
  - [ ] Run `npm audit` for security updates
  - [ ] Update dependencies regularly:
    ```bash
    npm outdated
    npm update
    ```

- [ ] Monitor code quality:
  - [ ] Review build logs for warnings
  - [ ] Keep test coverage above acceptable threshold
  - [ ] Review dependencies for vulnerabilities

## 🚀 You're Ready!

Once all items are checked, your project is fully set up for:
- ✅ Collaborative development
- ✅ Automated testing & building
- ✅ Continuous deployment to Vercel
- ✅ Secure branching & code review
- ✅ Environment management
- ✅ Production deployment

### Next Steps:

1. Start creating features on `feature/` branches
2. Open PRs to `develop`
3. When ready for production, merge `develop` → `main`
4. Vercel will auto-deploy to production
5. Monitor deployment and collect feedback

---

**Questions?** Check the relevant documentation file:
- [CONTRIBUTING.md](CONTRIBUTING.md) – Workflow & commits
- [DEPLOYMENT.md](DEPLOYMENT.md) – Vercel setup
- [GITHUB_SETUP.md](GITHUB_SETUP.md) – Security & secrets
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) – Common commands
