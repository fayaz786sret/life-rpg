import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

const DEMO_USER = {
  id: 'demo-hero-uuid-1234-5678',
  email: 'demo.hero@liferpg.realm',
  user_metadata: { username: 'Valiant Adventurer' },
  isDemo: true,
};

const DEMO_STORAGE_KEY = 'life_rpg_demo_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const storedDemo = localStorage.getItem(DEMO_STORAGE_KEY);
      if (storedDemo) {
        try {
          setUser(JSON.parse(storedDemo));
          setLoading(false);
          return;
        } catch {
          localStorage.removeItem(DEMO_STORAGE_KEY);
        }
      }

      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('restore session:', error.message);
        setUser(null);
      } else {
        setUser(data.session?.user ?? null);
      }
      setLoading(false);
    };

    restoreSession();

    // Keep in sync with Supabase auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!localStorage.getItem(DEMO_STORAGE_KEY)) {
          setUser(session?.user ?? null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  /* ── Email / Password ───────────────────────────────── */
  const signUp = async (email, password, username) => {
    localStorage.removeItem(DEMO_STORAGE_KEY);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    return { data, error };
  };

  const signIn = async (email, password) => {
    localStorage.removeItem(DEMO_STORAGE_KEY);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  /* ── Instant Demo Mode (Quick Play) ───────────────── */
  const signInAsDemoUser = () => {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(DEMO_USER));
    setUser(DEMO_USER);
    setLoading(false);
    return { success: true };
  };

  /* ── OAuth ──────────────────────────────────────────── */
  const getRedirectUrl = () => {
    // Use origin only to avoid mismatches with Supabase redirect URL settings.
    // Supabase expects the exact redirect URI configured in the dashboard (typically the origin).
    return `${window.location.origin}/`;
  };
  // OAuth removed: sign-in is email/password or demo only.

  /* ── Sign out ───────────────────────────────────────── */
  const signOut = async () => {
    localStorage.removeItem(DEMO_STORAGE_KEY);
    if (user?.isDemo) {
      setUser(null);
      return { error: null };
    }
    const { error } = await supabase.auth.signOut();
    setUser(null);
    return { error };
  };

  return (
    <AuthContext.Provider value={{
      user, loading, signUp, signIn, signInAsDemoUser,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};
