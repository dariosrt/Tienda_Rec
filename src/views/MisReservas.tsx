import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppFooter, AppHeader } from "../components/login";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { supabase } from "../utils/supabase";
import { CreditCard, Save, Trash2 } from "lucide-react";

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

export default function MisReservasPage() {
  const [userId, setUserId] = useState("");
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();



useEffect(() => {
  const checkAuthAndLoadOrders = async () => {
    const { data, error } = await supabase.auth.getUser();

    // DEPURACIÓN: Esto nos dirá por qué falla
    if (error) console.error("Error de Supabase:", error);
    if (!data.user) console.warn("No hay usuario detectado, redirigiendo...");

    if (error || !data.user) {
      navigate("/");
      return;
    }

    setUserId(data.user.id);
    await loadOrders(data.user.id);
  };

  checkAuthAndLoadOrders();
}, [navigate]);
  const loadOrders = async (currentUserId: string) => {
    setLoading(true);
    const { data: pedidos, error: pedidosError } = await supabase
      .from("pedido")
      .select("id_pedido, total, estado, fecha")
      .eq("id_usuario", currentUserId)
      .order("fecha", { ascending: false });

    if (pedidosError) {
      setError("No se pudieron cargar tus reservas.");
      setOrders([]);
      setLoading(false);
      return;
    }

    if (!pedidos || pedidos.length === 0) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const pedidoIds = pedidos.map((pedido) => pedido.id_pedido);
    const { data: lineas, error: lineasError } = await supabase
      .from("linea_pedido")
      .select("id_linea, id_pedido, id_producto, cantidad, precio_unidad")
      .in("id_pedido", pedidoIds);

    if (lineasError) {
      setError("No se pudieron cargar los detalles de las reservas.");
      setLoading(false);
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
    setLoading(false);
  };

  // --- DELETE: Función para eliminar una reserva ---
  const handleCancelOrder = async (idPedido: number) => {
    const order = orders.find(o => o.id_pedido === idPedido);
    
    if (order?.estado === 'pagado') {
      alert("No puedes cancelar una reserva que ya ha sido pagada.");
      return;
    }

    const confirmed = window.confirm("¿Seguro que deseas cancelar y eliminar esta reserva?");
    
    if (!confirmed) return;

    // 1. Primero borramos las líneas de pedido vinculadas (por restricción de Foreign Key)
    const { error: lineasError } = await supabase
      .from("linea_pedido")
      .delete()
      .eq("id_pedido", idPedido);

    if (lineasError) {
      alert("Error al intentar cancelar los productos de la reserva.");
      return;
    }

    // 2. Luego borramos el pedido principal
    const { error: pedidoError } = await supabase
      .from("pedido")
      .delete()
      .eq("id_pedido", idPedido);

    if (pedidoError) {
      alert("Error al intentar cancelar la reserva.");
      return;
    }

    // 3. Actualizamos el estado local (UI) para que desaparezca al instante
    setOrders((prevOrders) => prevOrders.filter((o) => o.id_pedido !== idPedido));
  };

const handleSimulatePayment = async (idPedido: number) => {
    const { error } = await supabase
      .from("pedido")
      .update({ estado: "pagado" })
      .eq("id_pedido", idPedido);

    if (error) {
      alert("Error al procesar el pago");
    } else {
      loadOrders(userId); // Recargar datos
    }
  };
const handleQtyChange = (idPedido: number, idLinea: number, nuevaCant: number) => {
    setOrders(prev => prev.map(o => o.id_pedido === idPedido ? {
        ...o,
        lineas: o.lineas.map(l => l.id_linea === idLinea ? { ...l, cantidad: Math.max(1, nuevaCant) } : l)
    } : o));
  };

  // NUEVO: Guardar cambios en DB
  const saveOrderChanges = async (order: UserOrder) => {
    for (const linea of order.lineas) {
      await supabase.from("linea_pedido").update({ cantidad: linea.cantidad }).eq("id_linea", linea.id_linea);
    }
    alert("Cambios guardados");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      <AppHeader />

      <main className="flex-1 flex items-start justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl">
          <Card className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <CardHeader className="space-y-2 px-6 py-6">
              <CardTitle className="text-3xl font-bold">Mis Reservas</CardTitle>
              <CardDescription>
                Gestiona tu historial de reservas. Puedes revisar los detalles o cancelarlas.
              </CardDescription>
              {error && <p className="text-sm text-destructive font-medium mt-2">{error}</p>}
            </CardHeader>

            <CardContent className="px-6 pb-6 space-y-4">
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-24 w-full rounded-2xl bg-muted" />
                  <div className="h-24 w-full rounded-2xl bg-muted" />
                </div>
              ) : orders.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-muted-foreground">No tienes reservas activas en este momento.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id_pedido} className="rounded-2xl border border-border bg-background p-5 shadow-sm transition-all hover:shadow-md">
                      
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground font-medium mb-1">
                            Reserva #{order.id_pedido}
                          </p>
                          <p className="font-semibold text-lg">
                            {new Date(order.fecha).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="rounded-full bg-secondary/20 px-3 py-1 text-xs font-bold uppercase text-secondary-foreground">
                            {order.estado}
                          </span>
                          <span className="text-lg font-bold">
                            {order.total.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                          </span>
                          

                        </div>
                          {/* Botón de Eliminar / Cancelar */}
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            title="Cancelar reserva"
                            onClick={() => handleCancelOrder(order.id_pedido)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                      </div>

                      {order.lineas.length > 0 ? (
                        <div className="mt-5 space-y-3 border-t border-border pt-4">
                          {orders.map((order) => (
                              <div key={order.id_pedido} className="rounded-2xl border p-5 shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                  <div>Reserva #{order.id_pedido} - <span className="uppercase font-bold text-xs">{order.estado}</span></div>
                                  
                                  {/* BOTONES ACCIÓN */}
                                  <div className="flex gap-2">
                                      {order.estado === "pendiente" && (
                                          <Button size="sm" variant="outline" onClick={() => handleSimulatePayment(order.id_pedido)}>
                                              <CreditCard className="mr-2 h-4 w-4"/> Pagar
                                          </Button>
                                      )}
                                      <Button variant="destructive" size="icon" onClick={() => handleCancelOrder(order.id_pedido)}><Trash2 className="h-4 w-4" /></Button>
                                  </div>
                                </div>

                                {order.lineas.map((linea) => (
                                  <div key={linea.id_linea} className="flex justify-between items-center mb-2">
                                    <span>Producto {linea.id_producto}</span>
                                    {order.estado === "pendiente" ? (
                                      <input 
                                          type="number" 
                                          value={linea.cantidad} 
                                          onChange={(e) => handleQtyChange(order.id_pedido, linea.id_linea, parseInt(e.target.value))}
                                          className="w-16 border rounded text-center"
                                      />
                                    ) : (
                                      <span>{linea.cantidad}</span>
                                    )}
                                  </div>
                                ))}
                                
                              {/* Solo mostrar si NO está pagado */}
                                {order.estado !== 'pagado' && (
                                  <Button 
                                    variant="destructive" 
                                    size="icon" 
                                    title="Cancelar reserva"
                                    onClick={() => handleCancelOrder(order.id_pedido)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="mt-4 text-sm text-muted-foreground">Esta reserva no tiene detalles asociados.</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}