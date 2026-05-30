import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { supabase } from "../../utils/supabase";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", isError: false });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(false); setMsg({ text: "", isError: false });
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setMsg({ text: error.message, isError: true });
    } else {
      setMsg({ text: "¡Enlace enviado! Revisa tu correo electrónico.", isError: false });
    }
    setLoading(false);
  }

  return (
    <div className="flex w-full items-center justify-center p-6 sm:p-8 lg:w-1/2">
      <Card className="w-full max-w-[400px] border-none shadow-none sm:border-solid sm:shadow-xs">
        <CardHeader className="space-y-2 px-0 sm:px-6">
          <CardTitle className="text-3xl font-bold tracking-tight">Recuperar contraseña</CardTitle>
          <CardDescription>Introduce tu correo para recibir un enlace de restauración.</CardDescription>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none" htmlFor="email">Correo Electrónico</label>
              <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" type="email" required disabled={loading} />
            </div>

            {msg.text && (
              <p className={`text-sm font-medium ${msg.isError ? "text-destructive" : "text-emerald-600"}`}>
                {msg.text}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full bg-indigo-700 hover:bg-indigo-800 text-white mt-2 cursor-pointer">
              {loading ? "Enviando..." : "Enviar enlace de recuperación"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}