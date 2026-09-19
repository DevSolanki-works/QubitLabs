"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  syncUserDataFromSupabase,
  migrateLocalDataToSupabase,
  clearClientUserData,
} from "@/lib/supabase/sync";

export type UserProfile = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  createdAt?: string;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<{ error?: string; requiresVerification?: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updatePassword: (password: string) => Promise<{ error?: string }>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured();

  const fetchProfile = useCallback(async (activeUser: User) => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", activeUser.id)
        .maybeSingle();

      if (error) {
        console.warn("Error fetching profile:", error);
      }

      const displayName =
        data?.display_name ||
        activeUser.user_metadata?.display_name ||
        activeUser.email?.split("@")[0] ||
        "Quantum Explorer";

      setProfile({
        id: activeUser.id,
        email: activeUser.email || "",
        displayName,
        avatarUrl: data?.avatar_url || null,
        createdAt: data?.created_at,
      });
    } catch (err) {
      console.error("Failed to load user profile:", err);
    }
  }, []);

  const handleUserSession = useCallback(
    async (currentSession: Session | null) => {
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchProfile(currentUser);
        // Migrate offline progress if any, then sync authoritative remote data
        await migrateLocalDataToSupabase(currentUser.id);
        await syncUserDataFromSupabase(currentUser.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    },
    [fetchProfile]
  );

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // Check active session on mount
    supabase.auth
      .getSession()
      .then(({ data }: { data: { session: Session | null } }) => {
        handleUserSession(data.session);
      })
      .catch((err: unknown) => {
        console.warn("Could not retrieve initial session:", err);
        setLoading(false);
      });

    // Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, newSession: Session | null) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        setSession(null);
        setProfile(null);
        clearClientUserData();
        setLoading(false);
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        await handleUserSession(newSession);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [configured, handleUserSession]);

  const signIn = async (email: string, password: string) => {
    if (!configured) {
      return { error: "Supabase authentication is not configured in this environment." };
    }
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        return { error: error.message };
      }
      return {};
    } catch (err) {
      return {
        error:
          err instanceof Error
            ? err.message
            : "An unexpected error occurred during login.",
      };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    if (!configured) {
      return { error: "Supabase authentication is not configured in this environment." };
    }
    const supabase = createClient();
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: displayName.trim(),
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      const requiresVerification =
        data.user && (!data.session || data.user.identities?.length === 0);

      return { requiresVerification: Boolean(requiresVerification) };
    } catch (err) {
      return {
        error:
          err instanceof Error
            ? err.message
            : "An unexpected error occurred during registration.",
      };
    }
  };

  const signOut = async () => {
    if (!configured) {
      clearClientUserData();
      setUser(null);
      setSession(null);
      setProfile(null);
      return;
    }
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Sign out error:", err);
    } finally {
      clearClientUserData();
      setUser(null);
      setSession(null);
      setProfile(null);
    }
  };

  const resetPassword = async (email: string) => {
    if (!configured) {
      return { error: "Supabase authentication is not configured in this environment." };
    }
    const supabase = createClient();
    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/reset-password`
          : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      if (error) return { error: error.message };
      return {};
    } catch (err) {
      return {
        error:
          err instanceof Error
            ? err.message
            : "Could not send password reset email.",
      };
    }
  };

  const updatePassword = async (password: string) => {
    if (!configured) {
      return { error: "Supabase authentication is not configured in this environment." };
    }
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });
      if (error) return { error: error.message };
      return {};
    } catch (err) {
      return {
        error:
          err instanceof Error
            ? err.message
            : "Could not update user password.",
      };
    }
  };

  const signInWithGoogle = async () => {
    if (!configured) {
      return { error: "Supabase authentication is not configured in this environment." };
    }
    const supabase = createClient();
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) return { error: error.message };
      return {};
    } catch (err) {
      return {
        error:
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while initiating Google sign-in.",
      };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isConfigured: configured,
        signIn,
        signInWithGoogle,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
