import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Cambia a 'next/navigation' si usas Next.js
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";

import { supabase } from "../../utils/supabase";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Reiniciamos errores y activamos estado de carga
    setErrorMsg("");
    setLoading(true);

    try {
      // 1. Autenticar al usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;

      const userId = authData.user.id;

      // 2. Consultar la tabla pública 'usuario' para obtener el rol
      const { data: profile, error: profileError } = await supabase
        .from("usuario")
        .select("rol")
        .eq("id_usuario", userId)
        .maybeSingle();

      if (profileError) {
        console.error("Error al obtener el perfil del usuario:", profileError);
        // Opcional: puedes lanzar un error aquí si es estrictamente necesario que tengan perfil
      }

      // 3. Lógica de redirección basada en el Enum 'rol_usuario' de tu DB
      const userRole = profile?.rol || 'cliente'; // Por defecto tratamos como cliente
      console.log(userRole);
      if (userRole === 'admin') {
        navigate("/admin/dashboard"); // Ajusta esta ruta según tu aplicación
      } else {
        navigate("/tienda"); // Ruta a landing 
      }

    } catch (error: any) {
      console.error(error);
      // Personaliza el mensaje según el error de Supabase
      if (error.message.includes("Invalid login credentials")) {
        setErrorMsg("El correo o la contraseña son incorrectos.");
      } else {
        setErrorMsg(error.message || "Ocurrió un error inesperado al iniciar sesión.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full items-center justify-center p-6 sm:p-8 lg:w-1/2">
      <Card className="w-full max-w-[400px] border-none shadow-none sm:border-solid sm:shadow-sm">
        <CardHeader className="space-y-2 px-0 sm:px-6">
          <CardTitle className="text-3xl font-bold tracking-tight">Bienvenido de nuevo</CardTitle>
          <CardDescription>Ingresa tus datos para iniciar sesión en tu cuenta.</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-5 px-0 sm:px-6">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="email"
              >
                Correo Electrónico
              </label>
              <Input 
                id="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@empresa.com" 
                type="email" 
                autoCapitalize="none" 
                autoComplete="email" 
                autoCorrect="off" 
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-2 mt-4">
              <div className="flex items-center justify-between">
                <label
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="password"
                >
                  Contraseña
                </label>
              </div>
              <Input 
                id="password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********" 
                type="password"
                required
                disabled={loading}
              />
            </div>

            {/* Mensaje de Error */}
            {errorMsg && (
              <p className="text-sm font-medium text-destructive mt-2">
                {errorMsg}
              </p>
            )}

            <Button 
              type="submit" 
              className="w-full bg-indigo-700 hover:bg-indigo-800 text-white mt-6"
              disabled={loading}
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="px-0 pt-4 sm:px-6">
          <p className="w-full text-center text-sm text-muted-foreground">
            ¿No tienes una cuenta?{' '}
            <Link to="/register">
              <span className="font-medium text-indigo-600 hover:underline">
                Crea una cuenta
              </span>
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}