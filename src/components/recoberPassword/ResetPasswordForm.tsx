import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { supabase } from "../../utils/supabase";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", isError: false });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) return setMsg({ text: "La contraseña debe tener al menos 6 caracteres.", isError: true });
    
    setLoading(true); setMsg({ text: "", isError: false });

    // Supabase actualiza directamente el usuario de la sesión de recuperación actual
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMsg({ text: error.message, isError: true });
    } else {
      setMsg({ text: "Contraseña actualizada con éxito. Ya puedes iniciar sesión.", isError: false });
      setPassword("");
    }
    setLoading(false);
  }

  return (
    <div className="flex w-full items-center justify-center p-6 sm:p-8 lg:w-1/2">
      <Card className="w-full max-w-[400px] border-none shadow-none sm:border-solid sm:shadow-xs">
        <CardHeader className="space-y-2 px-0 sm:px-6">
          <CardTitle className="text-3xl font-bold tracking-tight">Nueva Contraseña</CardTitle>
          <CardDescription>Introduce tu nueva clave de acceso segura.</CardDescription>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none" htmlFor="password">Contraseña Nueva</label>
              <Input id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" type="password" required disabled={loading} />
            </div>

            {msg.text && (
              <p className={`text-sm font-medium ${msg.isError ? "text-destructive" : "text-emerald-600"}`}>
                {msg.text}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full bg-indigo-700 hover:bg-indigo-800 text-white mt-2 cursor-pointer">
              {loading ? "Guardando..." : "Actualizar Contraseña"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}