'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '@/lib/types';

interface AuthContextValue {
  supabaseUser: SupabaseUser | null;
  profile: User | null;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  supabaseUser: null,
  profile: null,
  loading: true,
  signInWithEmail: async () => ({ error: null }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      const { data: bookmarks } = await supabase
        .from('bookmarks')
        .select('listing_id')
        .eq('user_id', userId);

      setProfile({
        id: data.id,
        name: data.name,
        email: data.email,
        verifiedUCLA: data.verified_ucla,
        bookmarks: (bookmarks ?? []).map((b: { listing_id: string }) => b.listing_id),
      });
    }
  }, [supabase]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  const signInWithEmail = async (email: string) => {
    let normalized = email.toLowerCase().trim();
    
    if (normalized.endsWith('@g.ucla.edu')) {
      normalized = normalized.replace('@g.ucla.edu', '@ucla.edu');
    }
    
    if (!normalized.endsWith('@ucla.edu')) {
      return { error: 'Only UCLA email addresses (@ucla.edu or @g.ucla.edu) are allowed.' };
    }
  
    const { error } = await supabase.auth.signInWithOtp({
      email: normalized,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: true,
      },
    });
  
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSupabaseUser(null);
  };

  return (
    <AuthContext.Provider value={{ supabaseUser, profile, loading, signInWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
