# Quick Reference Guide

A quick guide for common development tasks.

## Quick Commands

### Starting Development
```bash
# Install dependencies (first time)
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev

# Preview production build
npm run build && npm run preview
```

### Git Workflow (Gitflow Model)

```bash
# Update develop branch
git checkout develop
git pull origin develop

# Create a feature branch
git checkout -b feature/my-feature

# Make commits
git add .
git commit -m "feat: add something"

# Push to GitHub
git push origin feature/my-feature

# Open a PR on GitHub to develop

# After PR is merged:
git fetch origin
git checkout develop
git pull origin develop
```

### Creating a Hotfix (urgent production fix)

```bash
# Branch off main
git checkout main
git pull origin main
git checkout -b hotfix/urgent-fix

# Make fixes and commit
git add .
git commit -m "fix: urgent production issue"

# Push and create PR
git push origin hotfix/urgent-fix

# After merging to main, also merge to develop:
git checkout develop
git pull origin develop
git merge hotfix/urgent-fix
git push origin develop
```

### Updating a Feature Branch with Latest develop

```bash
git fetch origin
git rebase origin/develop
# or (if you have unpushed commits, be careful)
git push origin feature/my-feature --force
```

---

## Commit Message Format

```
<type>: <subject (max 50 chars)>

<optional body describing what and why>

<optional footer with issue refs>
```

**Types:**
- `feat` – New feature
- `fix` – Bug fix
- `docs` – Documentation
- `style` – Formatting, missing semicolons, etc.
- `refactor` – Code restructuring
- `test` – Adding/updating tests
- `chore` – Maintenance, dependencies

**Examples:**
```
feat: add portfolio rebalancing algorithm

Implements automatic portfolio rebalancing based on target allocations.
Uses mean-variance optimization for asset weights.

Closes #42

---

fix: resolve supabase connection timeout

The connection was failing due to long-running queries.
Added connection pooling and query optimization.

---

docs: update API documentation

Added examples for authentication endpoints.
```

---

## Code Review Checklist

Before submitting a PR, ensure:

- ✅ Code follows project style guidelines
- ✅ All tests pass locally: `npm run build`
- ✅ No console errors or warnings
- ✅ Comments added for complex logic
- ✅ No secrets or `.env` committed
- ✅ Updated documentation if needed
- ✅ Rebased on latest `develop` branch

---

## Debugging Tips

```bash
# Clear node_modules and reinstall
rm -r node_modules package-lock.json
npm install

# Clear Vite cache
rm -r node_modules/.vite

# Debug with browser DevTools
npm run dev
# Open Chrome DevTools (F12 or Ctrl+Shift+I)
# Check console, network, and sources tabs

# Check environment variables are loaded
# Add this to src/App.jsx:
console.log("VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL);
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| `ERR_NAME_NOT_RESOLVED` | Check `.env` has correct Supabase URL |
| Build fails: `dist` not found | Run `npm run build` locally, check for errors |
| Port 5173 already in use | Kill process: `lsof -ti :5173 \| xargs kill -9` |
| Vercel deploy fails | Check Vercel logs and GitHub Actions output |
| Module not found error | Run `npm install`, ensure all imports have correct paths |

---

## Useful Links

- **Repository**: https://github.com/basu41689-glitch/AstroAlpha
- **Project Setup**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Contribution Guide**: See [CONTRIBUTING.md](CONTRIBUTING.md)
- **GitHub Setup**: See [GITHUB_SETUP.md](GITHUB_SETUP.md)
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://app.supabase.com

---

## Getting Help

1. Check existing GitHub issues
2. Search [Stack Overflow](https://stackoverflow.com) with error message
3. Ask in PR comments for specific questions
4. Check [Vite docs](https://vitejs.dev), [React docs](https://react.dev)
