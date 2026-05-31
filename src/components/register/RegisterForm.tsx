import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { supabase } from "../../utils/supabase";

export function RegisterForm() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const navigate = useNavigate();
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setLoading(true);
  setErrorMsg("");

  try {
    // 1. Crear el usuario en Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre: nombre } }
    });

    if (authError) throw authError;

    // 2. Crear el perfil en la tabla public.usuario manualmente
    if (authData.user) {
      const { error: dbError } = await supabase
        .from("usuario")
        .insert([
          { 
            id_usuario: authData.user.id, 
            nombre: nombre, 
            email: email, 
            rol: 'cliente' 
          }
        ]);

      if (dbError) throw dbError;
    }

    navigate("/tienda");
  } catch (error: any) {
    console.error("Error detallado:", error);
    setErrorMsg(error.message);
  } finally {
    setLoading(false);
  }
}
  return (
    <div className="flex w-full items-center justify-center p-6 sm:p-8 lg:w-1/2">
      <Card className="w-full max-w-[400px] border-none shadow-none sm:border-solid sm:shadow-sm">
        <CardHeader className="space-y-2 px-0 sm:px-6">
          <CardTitle className="text-3xl font-bold tracking-tight">Crea una cuenta</CardTitle>
          <CardDescription>Ingresa tus datos para registrarte en ShopSphere.</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-5 px-0 sm:px-6">
          <form onSubmit={handleSubmit} className="grid gap-4">
            
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none" htmlFor="nombre">Nombre Completo</label>
              <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Juan Pérez" required disabled={loading} />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none" htmlFor="email">Correo Electrónico</label>
              <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nombre@empresa.com" type="email" required disabled={loading} />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none" htmlFor="password">Contraseña</label>
              <Input id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" type="password" required disabled={loading} />
            </div>

            {errorMsg && <p className="text-sm font-medium text-destructive">{errorMsg}</p>}

            <Button type="submit" className="w-full bg-indigo-700 hover:bg-indigo-800 text-white mt-2" disabled={loading}>
              {loading ? "Registrando..." : "Registrarse"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="px-0 pt-4 sm:px-6">
          <p className="w-full text-center text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login">
              <span className="font-medium text-indigo-600 hover:underline">
                Iniciar sesión
              </span>
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}