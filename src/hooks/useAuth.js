import { useState, useEffect, useContext, createContext } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // initial session check
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // listen for changes (login, logout, token refresh)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, data) => {
        setSession(data?.session || null);
      }
    );

    return () => listener.subscription?.unsubscribe();
  }, []);

  // derive a simplified user object with metadata convenience fields
  const user = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        full_name: session.user.user_metadata?.full_name,
        subscription_plan: session.user.user_metadata?.subscription_plan || 'free',
      }
    : null;

  return (
    <AuthContext.Provider value={{ session, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
