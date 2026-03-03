# Supabase Security & RLS Examples

This file collects the recommended Supabase settings and sample policies you
should apply as soon as your project is created.

## Dashboard Configuration

1. **Authentication → Settings**
   - Require email confirmations.
   - Enable the password complexity rules (min 8 chars, at least one number).
   - Disable `Allow OAuth sign in` if not needed.
   - Set `URL` and `Redirect URLs` to your production and dev domains only.
   - Turn on `HTTPS only`.

2. **Database → Policies**
   - Toggle **Row Level Security** on each table you create (shown as a lock
     icon).
   - Create policies using the SQL editor or the GUI.

3. **API → Settings**
   - Ensure `Enable direct REST` is off unless you really need it.
   - Do not expose the `SERVICE_ROLE_KEY`; use it only on the server.

## Example Policies

### users table
```sql
-- allow user to manage own profile
CREATE POLICY "select_own_user" ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "update_own_user" ON public.users
  FOR UPDATE USING (auth.uid() = id);
```

> **Subscription field**  
> In order to support paid plans down the road add a `subscription_plan`
> column (text) to the `users` or a separate `profiles` table.  Default value
> should be `'free'`. Enforce ownership with RLS as shown above, and update it
> via a server‑side function when billing changes.


### orders table (with owner column)
```sql
CREATE POLICY "users_can_insert_orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = owner);

CREATE POLICY "users_can_read_orders" ON public.orders
  FOR SELECT USING (auth.uid() = owner);

CREATE POLICY "users_can_update_orders" ON public.orders
  FOR UPDATE USING (auth.uid() = owner);

CREATE POLICY "users_can_delete_orders" ON public.orders
  FOR DELETE USING (auth.uid() = owner);
```

### generic RLS template
```sql
CREATE POLICY "own_row_only" ON public.%table%
  FOR ALL USING (auth.uid() = %column%);
```

## Testing Policies

Use the **Policy Simulator** in the Supabase dashboard to run queries as a
particular user and verify the policy behavior. Always test write operations
with both allowed and disallowed users.

## Additional Hardening

- Enable `pgbouncer` connection pooling if you expect high traffic.
- Add nightly cleanup of audit logs and expired sessions.

Refer to the [Supabase docs](https://supabase.com/docs/guides/auth#row-level-security)
for deeper details. Ensure your backend code never bypasses RLS by accident.
