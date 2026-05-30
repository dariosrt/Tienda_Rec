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

interface OrderLine {
  id_linea: number;
  id_pedido: number;
  id_producto: number;
  cantidad: number;
  precio_unidad: number;
}

interface UserOrder {
  id_pedido: number;
  total: number;
  estado: string;
  fecha: string;
  lineas: OrderLine[];
}

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        navigate("/");
        return;
      }

      setName(user.user_metadata?.nombre || "");
      setAvatarUrl(user.user_metadata?.avatar_url || "");
      setLoading(false);
      await loadOrders(user.id);
    };

    loadUser();
  }, [navigate]);

  const loadOrders = async (userId: string) => {
    setOrdersLoading(true);
    const { data: pedidos, error: pedidosError } = await supabase
      .from("pedido")
      .select("id_pedido, total, estado, fecha")
      .eq("id_usuario", userId)
      .order("fecha", { ascending: false });

    if (pedidosError) {
      setError(pedidosError.message || "No se pudieron cargar tus pedidos.");
      setOrders([]);
      setOrdersLoading(false);
      return;
    }

    if (!pedidos || pedidos.length === 0) {
      setOrders([]);
      setOrdersLoading(false);
      return;
    }

    const pedidoIds = pedidos.map((pedido) => pedido.id_pedido);
    const { data: lineas, error: lineasError } = await supabase
      .from("linea_pedido")
      .select("id_linea, id_pedido, id_producto, cantidad, precio_unidad")
      .in("id_pedido", pedidoIds);

    if (lineasError) {
      setError(lineasError.message || "No se pudieron cargar las líneas de pedido.");
      setOrders(
        pedidos.map((pedido) => ({ ...pedido, lineas: [] })) as UserOrder[]
      );
      setOrdersLoading(false);
      return;
    }

    const lineasPorPedido = (lineas || []).reduce((acc, linea) => {
      if (!acc[linea.id_pedido]) acc[linea.id_pedido] = [];
      acc[linea.id_pedido].push(linea);
      return acc;
    }, {} as Record<number, OrderLine[]>);

    setOrders(
      pedidos.map((pedido) => ({
        ...pedido,
        lineas: lineasPorPedido[pedido.id_pedido] || [],
      })) as UserOrder[]
    );
    setOrdersLoading(false);
  };

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const { error } = await supabase.auth.updateUser({
      data: {
        nombre: name,
        avatar_url: avatarUrl,
      },
    });

    if (error) {
      setError(error.message || "No se pudo actualizar el perfil.");
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

    const { error } = await supabase.auth.deleteUser();

    if (error) {
      setError(error.message || "No se pudo eliminar la cuenta.");
      return;
    }

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
              <CardDescription>
                Edita tu nombre y la URL de tu imagen de perfil. También puedes eliminar tu cuenta si lo deseas.
              </CardDescription>
            </CardHeader>

            <CardContent className="px-6 pb-6">
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-8 w-48 rounded-full bg-muted" />
                  <div className="h-4 w-full rounded-full bg-muted" />
                  <div className="h-4 w-full rounded-full bg-muted" />
                  <div className="h-4 w-3/4 rounded-full bg-muted" />
                </div>
              ) : (
                <form className="grid gap-5" onSubmit={handleSave}>
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

                  <div className="grid gap-2">
                    <label className="text-sm font-medium leading-none" htmlFor="avatarUrl">
                      URL de la imagen
                    </label>
                    <Input
                      id="avatarUrl"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://..."
                      type="url"
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

          <div className="mt-6">
            <Card className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
              <CardHeader className="space-y-2 px-6 py-6">
                <CardTitle className="text-3xl font-bold">Mis pedidos</CardTitle>
                <CardDescription>
                  Revisa el historial de pedidos y los productos incluidos en cada uno.
                </CardDescription>
              </CardHeader>

              <CardContent className="px-6 pb-6 space-y-4">
                {ordersLoading ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-6 w-32 rounded-full bg-muted" />
                    <div className="h-4 w-full rounded-full bg-muted" />
                    <div className="h-4 w-full rounded-full bg-muted" />
                  </div>
                ) : orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tienes pedidos registrados todavía.</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id_pedido} className="rounded-3xl border border-border bg-background/80 p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Pedido #{order.id_pedido}</p>
                            <p className="font-semibold">{new Date(order.fecha).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-secondary/20 px-3 py-1 text-xs font-semibold uppercase text-secondary-foreground">
                              {order.estado}
                            </span>
                            <span className="text-sm font-bold">{order.total.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</span>
                          </div>
                        </div>
                        {order.lineas.length > 0 ? (
                          <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm text-muted-foreground">
                            {order.lineas.map((linea) => (
                              <div key={linea.id_linea} className="flex justify-between gap-4">
                                <span>Producto #{linea.id_producto}</span>
                                <span>{linea.cantidad} x {linea.precio_unidad.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-4 text-sm text-muted-foreground">No hay líneas de pedido disponibles para este pedido.</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
