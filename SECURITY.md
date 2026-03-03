# Security Hardening Guide

This document describes how to secure a production-ready React (Vite) + Supabase application.
Follow industry best practices; do **not** cut corners.

---

## 1. Environment Variables Structure

### File layout

```
/ (repo root)
  ├─ .env            # local only, gitignored
  ├─ .env.example    # committed safe template
  ├─ server/.env     # backend-only secrets
  └─ .gitignore      # already includes .env and /server/.env
```

> **.env** must never be committed. It lives on developers' machines only and
should contain only `VITE_` vars that are safe in the browser.

### Frontend variables (in `.env`)
```
VITE_SUPABASE_URL=https://abcd1234.supabase.co
VITE_SUPABASE_ANON_KEY=public-anon-key
```

*Only the **anon** key may be exposed to the client.*
Never add a `SERVICE_ROLE_KEY` or any other secret to the frontend.

The `.env.example` file should mirror the above with placeholders; use it as
reference for new developers.

### Backend variables (in `server/.env`)
```
SUPABASE_SERVICE_KEY=••••••
OPENAI_API_KEY=••••••
NODE_ENV=production
PORT=3000
CORS_ORIGINS=https://yourdomain.com
```

Backend secrets are **never** checked in. The server reads them directly from
`process.env` and they are injected by the hosting provider (Vercel, Render,
etc.).

### Supabase client configuration (`src/lib/supabaseClient.js`)
```javascript
import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const key = process.env.REACT_APP_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.warn('Missing Supabase public credentials');
}

export const supabase = createClient(url, key);
```

> Only the anon key and URL are loaded here; no service key is accessible.

---

## 2. Supabase Security Configuration

### Must enable
- **Row Level Security (RLS)** on every table. Tables are locked down by
default when RLS is enabled.
- **Email confirmation** for auth sign-ups.
- **Restrictive password rules** (min length, complexity) under
  Authentication → Password Policies.
- **HTTPS only** connections.
- **Restricted redirect URLs**: whitelist only your production/test domains.
  Avoid wildcards (`*`).

> Guard the `SUPABASE_SERVICE_KEY` as it bypasses policies; store it only on
  the server and use it for scheduled jobs or trusted backend endpoints.

### Must disable/avoid
- Public access to tables without policies.
- Wildcard redirect URLs.
- Usage of the service role key in frontend code.

### Example RLS policies

```sql
-- allow users to read and update only their own rows
CREATE POLICY "users_select_self" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_self" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- generic pattern for other tables with "owner" column
CREATE POLICY "own_data_only" ON public.xyz
  FOR ALL USING (auth.uid() = owner);
```

Remember to test policies using Supabase's "Policy Simulator" panel.

---

## 3. Authentication Hardening

> **Subscription metadata**  
> A `subscription_plan` field may be added to `user_metadata` or a separate
> `profiles` table. Use RLS to ensure users can only read/update their own plan
> and never expose billing logic on the client.

### React utilities

**src/hooks/useAuth.js**
```javascript
import { useState, useEffect, useContext, createContext } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, data) => {
      setSession(data.session);
    });

    return () => listener?.subscription?.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

**src/components/PrivateRoute.jsx**
```jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function PrivateRoute({ children }) {
  const { session, loading } = useAuth();

  if (loading) return <div>Loading…</div>;
  if (!session) return <Navigate to="/login" replace />;

  return children;
}
```

*Wrap protected pages with `<PrivateRoute>` inside your router.*
The hook detects token expiry automatically via Supabase's listener and
`session` becomes `null` when the user is logged out.

---

## 4. Frontend Security Best Practices

- Validate all user inputs using utility functions (`src/utils/validators.js`).
- Never use `dangerouslySetInnerHTML`; if you must render HTML from external
  sources, sanitize it first with a library such as DOMPurify:
  ```js
  import DOMPurify from 'dompurify';
  const safeHtml = DOMPurify.sanitize(userSuppliedHtml);
  ```
- Wrap every Supabase call in `try/catch` and handle errors gracefully:
  ```js
  try {
    const { data, error } = await supabase.from('stocks').insert(formValues);
    if (error) throw error;
  } catch (err) {
    console.error('Database error', err);
    setErrorMessage(err.message);
  }
  ```
- Escape or encode any data inserted into the DOM to avoid XSS.
- Use HTTPS for all API calls; the browser will enforce this automatically
  when deployed to Vercel/Render.

---

## 5. Production Deployment Settings

### Vercel
- Add environment variables in the Vercel dashboard under Settings >
  Environment Variables (`VITE_SUPABASE_URL`, etc.).
- **Do not commit** any secrets to GitHub; use the dashboard instead.
- Build command: `npm run build`; output directory: `dist` (configured in
  `vercel.json`).
- Enable `Only allow merge to main` and Set `Production Branch` to `main`.

### Supabase
- Add the service role key as a protected secret in your backend only.
- Set database pool limits and row limits for rate limiting (see below).

---

## 6. Extra Protection

### Rate Limiting
Implement on the backend using either Supabase edge functions or your own
server.  Example strategy:
- Limit writes to 5 per minute per user by tracking a `requests` table.
- Use a Redis or in-memory counter on a Node/Express proxy if you need
  millisecond granularity.

### Logging
- Log all authentication events, failed policy checks, and unusual volume
  of requests to Supabase's Audit Logs (in the dashboard) or to an external
  service (e.g. Datadog, Papertrail).
- Client‑side, catch and report errors with Sentry or similar.

### Detecting Suspicious Activity
- Alert when a single IP address performs repeated login failures.
- Monitor for sudden spikes in data writes or policy violations.
- Use Supabase `pg_stat_activity` to see long-running queries.

### Key Rotation
1. Generate new keys in the Supabase dashboard.
2. Update environment variables in Vercel/Render.
3. Deploy during a low-traffic window.
4. Verify no errors, then **revoke** the old key immediately.
5. If using CI/CD, update GitHub secrets accordingly.

---

## 7. Folder Structure (secure)

```
/                  # project root
  .env            # ignored
  .env.example    # safe template
  SECURITY.md     # this document
  README.md       # general docs
  render.yaml     # render deployment config
  vercel.json     # vercel build settings
  /src
    /components
      PrivateRoute.jsx
    /hooks
      useAuth.js
    /lib
      supabaseClient.js
    /utils
      validators.js
    /pages
      Dashboard.jsx (wrapped in PrivateRoute)

  /server
    index.js
    services/
      supabase.js  # server‑side client uses service role key
    .env          # backend secrets
```

## 8. Summary
Securing a production application requires careful handling of secrets,
enabling RLS, protecting authentication flows, validating inputs, and
configuring deployment providers correctly. The above structure and
snippets give you a rock-solid starting point; review them regularly as you
develop and before every release.

Stay vigilant and treat security as an ongoing responsibility.
