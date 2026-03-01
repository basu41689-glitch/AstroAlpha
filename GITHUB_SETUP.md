# Branch Protection & GitHub Security Setup

After creating your GitHub repository, we recommend setting up branch protection rules to enforce code quality and prevent accidental pushes to production branches.

## Set Up Branch Protection for `main`

1. Go to your GitHub repository
2. Navigate to **Settings → Branches**
3. Click **"Add branch protection rule"**
4. Enter **`main`** as the branch name pattern
5. Enable the following options:

   ✅ **Require a pull request before merging**
   - Require approvals: **1** (or more, based on team size)
   - Dismiss stale pull request approvals: **Yes**
   - Require code review from code owners: **Optional**

   ✅ **Require status checks to pass before merging**
   - Require branches to be up to date before merging: **Yes**
   - Status checks that must pass:
     - `build-and-test / build-and-test`
     - `test-lint / test-lint`
     - `security-scan / security-scan`

   ✅ **Require a conversation resolution before merging** (optional)

   ✅ **Include administrators** (optional, but recommended)

6. Click **"Create"**

---

## Set Up Branch Protection for `develop`

Repeat the same steps as above, but use **`develop`** as the branch name and be slightly more lenient:

1. Go to **Settings → Branches** → **"Add branch protection rule"**
2. Enter **`develop`**
3. Enable:

   ✅ **Require a pull request before merging**
   - Require approvals: **1**
   - Dismiss stale pull request approvals: **Yes**

   ✅ **Require status checks to pass before merging**
   - Same status checks as `main`

This is less strict than `main` to allow faster feature integration, but still maintains quality standards.

---

## (Optional) Set Up CODEOWNERS

Create a `.github/CODEOWNERS` file to automatically request reviews from specific team members:

```
# Global owners for all files (replace with your GitHub username)
*       @basu41689-glitch

# Specific component owners
/src/components/     @your-username
/pages/              @your-username

# Documentation
/docs/               @your-username
*.md                 @your-username
```

---

## GitHub Secrets Setup (for Vercel Deployment)

For the Vercel deployment workflow to work, add these secrets:

1. Go to **Settings → Secrets and variables → Actions**
2. Click **"New repository secret"** and add:

| Secret Name | Value | How to Get |
|-------------|-------|-----------|
| `VERCEL_TOKEN` | Your Vercel token | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Your Vercel org ID | Run `npx vercel link` locally, check `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Your Vercel project ID | Same as above |

---

## GitHub Actions Secrets (if using npm registry with private packages)

If you're using private npm packages, add:

| Secret Name | Value |
|-------------|-------|
| `NPM_TOKEN` | Your npm personal access token |

Then in your workflow, authenticate with:
```yaml
- name: Setup npm
  run: |
    echo "//registry.npmjs.org/:_authToken=${{ secrets.NPM_TOKEN }}" > ~/.npmrc
```

---

## Auto-Merge for Dependabot (Optional)

To auto-merge dependabot updates:

1. Go to **Settings → Code security and analysis** (if available)
2. Enable **"Dependabot security updates"**
3. Go to **Settings → Branches → Branch protection rule** for `develop`
4. Check **"Auto-delete head branches"** to clean up merged branches

---

## Webhook Notifications (Optional)

Set up notifications for merges, pushes, or CI failures:

1. Go to **Settings → Webhooks** → **"Add webhook"**
2. Enter your Slack/Discord webhook URL
3. Select events: `push`, `pull_request`, `workflow_run`

---

## Typical Workflow After Setup

1. Create a feature branch from `develop`:
   ```bash
   git checkout develop
   git checkout -b feature/my-feature
   ```

2. Push and create a PR to `develop`

3. GitHub Actions automatically runs CI checks

4. Once approved and checks pass, merge to `develop` (squash recommended)

5. When ready for production, create a PR from `develop` → `main`

6. After approval and checks pass, merge to `main`

7. GitHub Actions automatically deploys to Vercel production

---

For more information:
- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GitHub CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
