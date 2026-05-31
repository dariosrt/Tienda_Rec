import { useEffect, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { supabase } from "../utils/supabase";
import { AppFooter, AppHeader } from "../components/login";

interface Usuario {
  id_usuario: string;
  email: string;
  nombre?: string;
  rol: "cliente" | "admin" | string;
}

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsuarios();
  }, []);

async function fetchUsuarios() {
  setLoading(true);
  const { data, error } = await supabase
    .from("usuario")
    .select("*")
    .order("id_usuario", { ascending: false });

  if (error) {
    console.error("Error al cargar usuarios:", error); // MIRA ESTO EN LA CONSOLA F12
  } else {
    console.log("Datos recibidos:", data); // SI SALE VACÍO AQUÍ, EL PROBLEMA ES LA CONSULTA O LA RLS
    setUsuarios(data as Usuario[]);
  }
  setLoading(false);
}

  const filtered = usuarios.filter((u) => {
    const matchesSearch = (u.nombre || "").toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === "all" ? true : u.rol === filterRole;
    return matchesSearch && matchesRole;
  });

async function handleDelete(u: Usuario) {
  // 1. Protección en el frontend
  if (u.rol === 'admin') {
    alert("No puedes eliminar a un administrador.");
    return;
  }

  if (!confirm("¿Eliminar este usuario?")) return;
  
  const { error } = await supabase
    .from("usuario")
    .delete()
    .eq("id_usuario", u.id_usuario);

  if (error) {
    console.error("Error al borrar:", error);
    alert("No tienes permisos para borrar este usuario.");
  } else {
    fetchUsuarios();
  }
}

  function initials(name?: string) {
    if (!name) return "US";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <AppHeader />

      <main className="flex-1 w-full space-y-6 p-2 sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
            <p className="text-sm text-muted-foreground">Consulta y filtra usuarios registrados por rol.</p>
          </div>
        </div>

        <Separator />

        <div className="flex gap-4 items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Buscar por nombre o email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="rounded-md border px-3 py-2 bg-card text-sm">
            <option value="all">Todos</option>
            <option value="cliente">Clientes</option>
            <option value="admin">Administradores</option>
          </select>

          <Button onClick={fetchUsuarios} className="ml-auto">Refrescar</Button>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-muted/40 text-muted-foreground border-b border-border text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-semibold">Usuario</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Rol</th>
                  <th className="p-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr><td colSpan={4} className="p-8 text-center">Cargando...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No hay usuarios que coincidan.</td></tr>
                ) : (
                  filtered.map((u) => (
                    <tr key={u.id_usuario} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold uppercase text-xs">{initials(u.nombre)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-foreground">{u.nombre || "Usuario sin nombre"}</div>
                            <div className="text-xs text-muted-foreground">ID: {u.id_usuario}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{u.email}</td>
                      <td className="p-4">
                        <Badge variant={u.rol === "admin" ? "destructive" : "secondary"} className="capitalize">{u.rol}</Badge>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(u)} title="Borrar usuario">
                          <Trash2 className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      <AppFooter />
    </div>
  )
}