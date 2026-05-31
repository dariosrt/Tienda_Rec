import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase"; // Ajusta tu ruta

// --- 1. SOLO PARA NO LOGUEADOS (Login/Registro) ---
export const useRequireGuest = () => {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) navigate("/perfil"); // Si ya está dentro, a su perfil
    });
  }, [navigate]);
};

// --- 2. CUALQUIER LOGUEADO (Clientes y Admins pueden entrar aquí) ---
export const useRequireAuth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) navigate("/");
      setLoading(false);
    });
  }, [navigate]);
  
  return { loading };
};

// --- 3. SOLO PARA ADMINISTRADORES ---
export const useRequireAdmin = () => {
  const navigate = useNavigate();
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  useEffect(() => {
    const verificarAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate("/");
        return;
      }

      // Consulta simple (asegúrate de que RLS permita esto)
      const { data: profile } = await supabase
        .from("usuario")
        .select("rol")
        .eq("id_usuario", user.id)
        .maybeSingle();

      if (!profile || (profile.rol !== "admin" && profile.rol !== "administrador")) {
        navigate("/perfil"); // Si no es admin, no lo eches, mándalo a su perfil
      } else {
        setIsCheckingAdmin(false);
      }
    };

    verificarAdmin();
  }, [navigate]);

  return { isCheckingAdmin };
};