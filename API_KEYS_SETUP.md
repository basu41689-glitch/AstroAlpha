# API Keys Setup Guide

## Overview

This document explains how to securely configure API keys and environment variables for the AstroApla project. **All API keys must be placed in the `.env` file at the project root**, never hardcoded in source files or committed to version control.

---

## Security Best Practices

✅ **DO:**
- Store all API keys in the `.env` file
- Use environment variables to access keys in backend code
- Add `.env` to `.gitignore` (already done)
- Rotate API keys periodically
- Use different keys for development vs. production
- Keep `.env` file protected with restricted file permissions

❌ **DON'T:**
- Hardcode API keys in JavaScript/Python files
- Commit `.env` file to GitHub or any version control
- Share API keys in chat, email, or documentation
- Use the same key for multiple environments
- Expose keys in browser console or frontend code

---

## Required API Keys

### 1. **OpenAI API Key** (Required for AI Features)

#### How to Get:
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. Copy the key (starts with `sk-proj-` or `sk-`)

#### In `.env` file:
```bash
# Backend (Required for server-side AI operations)
OPENAI_API_KEY=sk-your-actual-openai-key-here

# Frontend placeholder (DO NOT add real key here)
VITE_OPENAI_API_KEY=sk-demo-key-placeholder
```

#### Usage in Code:
```javascript
// server/index.js and src/lib/aiAgent.js
// Automatically loaded from environment
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
```

---

<!-- Base44 integration removed: no additional API key required -->

---

### 3. **Supabase Keys** (Database Configuration)

#### How to Get:
1. Go to [Supabase](https://supabase.com/)
2. Create a project or use existing one
3. Navigate to **Settings** → **API**
4. Copy the **URL** and **anon key**

#### In `.env` file:
```bash
# Supabase configuration (hosted database)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-supabase-anon-key

# Local development (optional)
# VITE_SUPABASE_URL=http://localhost:54321
# VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Environment Variables Reference

### Frontend Variables (Available in Browser)
Only use `VITE_` prefixed variables for frontend. **Never put real API keys here.**

```bash
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_OPENAI_API_KEY=sk-demo-key-placeholder  # Demo only!
VITE_API_BASE_URL=/api  # or your production API URL
```

### Backend Variables (Server Only)
These variables are only accessible on the backend server.

```bash
OPENAI_API_KEY=sk-your-actual-key
NODE_ENV=development
PORT=3001
```

---

## Setup Instructions

### Step 1: Copy the Example File
```bash
# The .env file already exists with placeholders
# No need to copy .env.example
# Just edit the existing .env file
```

### Step 2: Add Your API Keys
```bash
# Edit .env file and replace placeholders with actual keys
nano .env   # or use your favorite editor
```

### Step 3: Verify Keys Are Not Committed
```bash
# Check that .env is in .gitignore
cat .gitignore

# You should see: .env
```

### Step 4: Restart Development Server
```bash
# Kill running servers
Ctrl+C

# Reinstall dependencies (if adding new packages like dotenv)
npm install

# Start fresh
npm run dev       # Frontend
npm run server    # Backend (in another terminal)
```

---

## How API Keys Work in This Project

### Frontend (.env variables with VITE_ prefix)
```javascript
// Compiled into JavaScript at build time
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// WARNING: Never use real API keys here!
// Frontend code is visible to all users
```

### Backend (environment variables directly)
```javascript
// server/index.js loads .env via dotenv
import dotenv from 'dotenv';
dotenv.config(); // Loads .env file

// Access in code
const openaiKey = process.env.OPENAI_API_KEY;
const port = process.env.PORT;
```

---

## Production Deployment

### For Vercel/Netlify:
1. Go to project settings
2. Add **Environment Variables**
3. Set same keys as local `.env`

```bash
# Example for Vercel
OPENAI_API_KEY = sk-your-production-key
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_KEY = your-production-key
```

### For Self-Hosted:
1. Set environment variables on your server
2. Or create `.env` file in deployment directory
3. Never commit `.env` to production repository

```bash
# On server
export OPENAI_API_KEY=sk-production-key
export PORT=3001
```

---

## Troubleshooting

### ❌ "OPENAI_API_KEY is undefined"
- Check `.env` file exists at project root
- Verify `OPENAI_API_KEY=sk-...` is set
- Restart backend server after editing `.env`
- Ensure `dotenv` is imported in `server/index.js`

### ❌ "API key is invalid" (when calling OpenAI)
- Verify key starts with `sk-` or `sk-proj-`
- Check key is not truncated in `.env`
- Confirm you're using production key, not test key
- Verify key hasn't been revoked in OpenAI dashboard

### ❌ "Cannot find module 'dotenv'"
```bash
npm install dotenv
```

### ✅ "Everything working!"
- Check terminal logs for `🚀 Backend server listening on...`
- Frontend loads without errors
- API calls work without 401/403 errors

---

## File Status Check

```bash
# Verify .env is properly ignored
git status     # Should NOT show .env
git check-ignore .env  # Should return: .env

# Verify .env has no real keys in git history
git log --all -S "sk-proj" -- .env  # Should return nothing
```

---

## Summary

| File | Purpose | Commitment | Contains Secrets? |
|------|---------|-----------|-----------------|
| `.env` | Runtime config | ❌ NO (.gitignore) | ✅ YES (production) |
| `.env.example` | Template | ✅ YES | ❌ NO (placeholders) |
| Source files | Code logic | ✅ YES | ❌ NO (uses env vars) |
| `.gitignore` | Git rules | ✅ YES | ❌ NO |

---

## Questions?

- Check OpenAI docs: https://platform.openai.com/docs
- Check Supabase docs: https://supabase.com/docs
- Check LLM provider docs if using one
