import { useAuth } from './useAuth';

// Simple hook to read subscription plan stored in user metadata
// Supabase `user_metadata` can include a `subscription_plan` field (e.g. 'free', 'pro').
// When you later integrate Stripe, update this hook to fetch from a dedicated
// billing table or call a server function.

export function useSubscription() {
  const { session } = useAuth();
  if (!session?.user) return null;
  const plan = session.user.user_metadata?.subscription_plan || 'free';
  return plan;
}
