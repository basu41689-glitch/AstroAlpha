# Contributing to AI Stock Analyzer

Thank you for your interest in contributing to the AI Stock Analyzer project!

## Branching Strategy

We follow a **Gitflow** branching model:

### Main Branches

- **`main`** – Production-ready code. Every merge here triggers a production deployment to Vercel.
- **`develop`** – Integration branch for features. Preview deployments are created for each PR.

### Branch Types

#### Feature Branches
Branch off from `develop` for new features or enhancements.

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

Naming convention: `feature/short-description` (e.g., `feature/add-portfolio-rebalancing`)

#### Bug Fix Branches
Branch off from `develop` for bug fixes.

```bash
git checkout develop
git pull origin develop
git checkout -b bugfix/your-bug-fix
```

Naming convention: `bugfix/short-description` (e.g., `bugfix/fix-supabase-connection`)

#### Hotfix Branches
Branch off from `main` for urgent production fixes.

```bash
git checkout main
git pull origin main
git checkout -b hotfix/your-hotfix
```

Naming convention: `hotfix/short-description`

After merging into `main`, also merge back into `develop`:

```bash
git checkout develop
git merge hotfix/your-hotfix
```

### Release Branches
Prepare releases on a branch from `develop`.

```bash
git checkout develop
git checkout -b release/v1.0.0
```

Make version bumps and release notes here, then merge to both `main` and `develop`.

---

## Workflow

1. **Create a feature branch** from `develop`:
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make your changes** and commit with clear, descriptive messages:
   ```bash
   git add .
   git commit -m "Add feature: description of what was added"
   ```

3. **Push to origin**:
   ```bash
   git push origin feature/my-feature
   ```

4. **Open a Pull Request** on GitHub:
   - Set base branch to `develop` (for features/bugfixes) or `main` (for hotfixes).
   - Write a clear description of your changes.
   - Reference any related issues: `Closes #123`.

5. **GitHub Actions will automatically**:
   - Run the CI pipeline (build, test, security scan).
   - Create a preview deployment with Vercel.

6. **Code Review**:
   - One maintainer must approve before merging.
   - Address any feedback.

7. **Merge to develop** (or `main` for hotfixes):
   - Use "Squash and merge" for cleaner history, or "Create a merge commit" if you prefer detailed history.
   - Delete the feature branch afterward.

8. **When ready for production**:
   - Merge `develop` → `main` via a release PR.
   - This triggers a production deployment to Vercel.

---

## Commit Message Guidelines

Write clear, concise commit messages:

```
<type>: <short description (50 chars max)>

<optional longer description explaining the why and what>

<optional footer with breaking changes or issue references>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat: add portfolio rebalancing widget`
- `fix: resolve supabase connection timeout issue`
- `docs: update README with Vercel setup instructions`
- `refactor: simplify AIAnalysisPanel component`
- `chore: add GitHub Actions CI/CD workflows`

---

## GitHub Actions Workflows

Two workflows run automatically on every push and PR:

### 1. **CI Pipeline** (`.github/workflows/ci.yml`)
- Installs dependencies
- Builds the project
- Runs security audits
- Uploads build artifacts

### 2. **Vercel Deployment** (`.github/workflows/deploy-vercel.yml`)
- Deploys to Vercel on push to `main` (production)
- Creates preview deployments for feature branches and PRs
- Posts preview URL as a comment on PRs

---

## Before You Push

1. **Test locally**:
   ```bash
   npm run dev       # start dev server
   npm run build     # verify production build works
   ```

2. **Update documentation** if needed (README, comments in code, etc.).

3. **Never commit secrets**:
   - `.env` should be in `.gitignore` ✅
   - Use Vercel's "Environment Variables" dashboard for production secrets.

4. **Keep branches up to date**:
   ```bash
   git fetch origin
   git rebase origin/develop
   ```

---

## Environment Variables

- **Local development**: Create a `.env` file (keep it in `.gitignore`).
- **Vercel production**: Set variables in Vercel dashboard → **Settings → Environment Variables**.
- **GitHub Actions**: If needed, add secrets via **Settings → Secrets and variables → Actions**.

Example for Vercel deployment:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Questions?

- Open an issue for bugs or feature requests.
- Discuss ideas in a PR comment.
- Check existing PRs/issues before creating duplicates.

Happy coding! 🚀
