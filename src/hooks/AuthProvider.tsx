import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

type Profile = { id_usuario: string; rol: string; nombre?: string; correo?: string } | null;
type AuthContextType = {
  user: any | null;
  profile: Profile;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile>(null);
  const [loading, setLoading] = useState(true);

  async function loadSession() {
    setLoading(true);
    const { data } = await supabase.auth.getUser();
    setUser(data?.user ?? null);
    if (data?.user) {
      const { data: prof } = await supabase
        .from("usuario")
        .select("*")
        .eq("id_usuario", data.user.id)
        .maybeSingle();
      setProfile(prof ?? null);
    } else {
      setProfile(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadSession();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadSession();
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const refreshProfile = async () => loadSession();
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};