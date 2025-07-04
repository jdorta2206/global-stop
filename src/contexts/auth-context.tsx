// src/contexts/auth-context.tsx
'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

// Simple toast implementation as fallback
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  console[type === 'success' ? 'log' : 'error'](message);
  // In a real app, you might want to implement a proper toast UI here
};

interface AuthContextType {
  user: any;
  session: any;
  loading: boolean;
  signInWithProvider: (provider: 'google' | 'github') => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      setSession(session);
      setUser(session?.user ?? null);
      router.refresh();
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  const signInWithProvider = async (provider: 'google' | 'github') => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      showToast(error.message || 'Failed to sign in', 'error');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/');
      showToast('Signed out successfully');
    } catch (error: any) {
      showToast(error.message || 'Failed to sign out', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signInWithProvider,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};