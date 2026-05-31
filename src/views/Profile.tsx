import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppFooter, AppHeader } from "../components/login";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Separator } from "../components/ui/separator";
import { supabase } from "../utils/supabase";
import { User } from "lucide-react";


export default function ProfilePage() {
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        navigate("/");
        return;
      }

      setUserId(session.user.id);
      setName(session.user.user_metadata?.nombre || "");
      setLoading(false);
      // FÍJATE AQUÍ: Ya no llamamos a loadOrders()
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) navigate("/");
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  async function handleSave(e: FormEvent) {
    // ... el resto de tus funciones de guardado y logout ...
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const { error: authError } = await supabase.auth.updateUser({
      data: { nombre: name },
    });

    if (authError) {
      setError(authError.message || "No se pudo actualizar el perfil.");
      setSaving(false);
      return;
    }

    const { error: dbError } = await supabase
      .from("usuario")
      .update({ nombre: name })
      .eq("id_usuario", userId);

    if (dbError) {
      setError(dbError.message || "Error al guardar en la base de datos.");
    } else {
      setMessage("Perfil actualizado correctamente.");
    }

    setSaving(false);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer."
    );
    if (!confirmed) return;

    const { error } = await supabase.rpc("delete_current_user");

    if (error) {
      setError(error.message || "No se pudo eliminar la cuenta.");
      return;
    }

    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      <AppHeader />

      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl">
          <Card className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <CardHeader className="space-y-2 px-6 py-6">
              <CardTitle className="text-3xl font-bold">Perfil de usuario</CardTitle>
            </CardHeader>

            <CardContent className="px-6 pb-6">
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-8 w-48 rounded-full bg-muted" />
                  <div className="h-4 w-full rounded-full bg-muted" />
                </div>
              ) : (
                <form className="grid gap-5" onSubmit={handleSave}>
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 overflow-hidden rounded-full border bg-muted flex items-center justify-center">
                      <User className="size-[90%]" />
                    </div>
                    <h1>{name}</h1>
                  </div>

                  <Separator />

                  <div className="grid gap-2">
                    <label className="text-sm font-medium leading-none" htmlFor="name">
                      Nombre de usuario
                    </label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre"
                      required
                    />
                  </div>

                  {message && <p className="text-sm text-emerald-600">{message}</p>}
                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button type="submit" className="w-full sm:w-auto" disabled={saving}>
                      {saving ? "Guardando..." : "Guardar cambios"}
                    </Button>
                    <Button type="button" variant="secondary" onClick={handleLogout} className="w-full sm:w-auto">
                      Cerrar sesión
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>

            <Separator />

            <CardFooter className="flex flex-col gap-3 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Eliminar cuenta</CardTitle>
                <CardDescription>Esta acción eliminará tu cuenta de forma permanente.</CardDescription>
              </div>
              <Button variant="destructive" onClick={handleDeleteAccount} className="w-full sm:w-auto">
                Eliminar cuenta
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}