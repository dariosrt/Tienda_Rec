import { useState, useEffect } from "react";
import { Minus, Plus, Trash2, ShoppingBag, CreditCard } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { loadCart, saveCart, removeCartItem } from "../lib/cart";
import { AppFooter, AppHeader } from "../components/login";
import { supabase } from "../utils/supabase";

interface CartItem {
    id_producto: number;
    nombre: string;
    precio: number;
    marca: string;
    imagen_url?: string;
    stock: number;
    cantidad: number;
}

export default function Carrito() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [simularPago, setSimularPago] = useState(false);

    useEffect(() => {
        setCart(loadCart());
    }, []);

    const updateQty = (id: number, inc: number) => {
        setCart((prev) => {
            const nextCart = prev.map((item) =>
                item.id_producto === id
                    ? { ...item, cantidad: Math.max(1, Math.min(item.stock, item.cantidad + inc)) }
                    : item
            );
            saveCart(nextCart);
            return nextCart;
        });
    };

    const subtotal = cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    const envio = subtotal > 150 || subtotal === 0 ? 0 : 9.99;

    const handlePay = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            alert("Debes iniciar sesión para realizar el pedido.");
            return;
        }

        const { data: nuevoPedido, error: pedidoError } = await supabase
            .from("pedido")
            .insert([{ 
                id_usuario: user.id, 
                total: subtotal + envio, 
                estado: simularPago ? "pagado" : "pendiente", 
                fecha: new Date().toISOString() 
            }])
            .select("id_pedido")
            .single();

        if (nuevoPedido) {
            const lineas = cart.map(item => ({
                id_pedido: nuevoPedido.id_pedido,
                id_producto: item.id_producto,
                cantidad: item.cantidad,
                precio_unidad: item.precio
            }));
            await supabase.from("linea_pedido").insert(lineas);
            saveCart([]);
            setCart([]);
            alert(`¡Pedido realizado con éxito! Estado: ${simularPago ? "Pagado" : "Pendiente"}`);
        }

        if (pedidoError) {
            console.error("Error al insertar pedido:", pedidoError);
            alert("Error al tramitar el pedido. Asegúrate de tener perfil registrado.");
        }
    }

    if (cart.length === 0) {
        return (
            <>
                <AppHeader />
                <div className="text-center py-16 bg-card rounded-xl border border-border max-w-md mx-auto mt-12">
                    <ShoppingBag className="size-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold">Tu carrito está vacío</h3>
                </div>
            </>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
            <AppHeader />
            <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-2xl font-bold tracking-tight mb-6">Tu Carrito ({cart.length})</h2>
                    {cart.map((item) => (
                        <Card key={item.id_producto} className="bg-card border-border overflow-hidden rounded-xl shadow-xs py-4">
                            <CardContent className="flex items-center gap-4 p-0 px-4">
                                <img src={item.imagen_url} alt={item.nombre} className="size-16 sm:size-20 rounded-lg object-cover bg-muted shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-sm sm:text-base line-clamp-1">{item.nombre}</h3>
                                    <p className="font-semibold text-sm mt-1">{(item.precio * item.cantidad).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</p>
                                </div>
                                <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
                                    <Button variant="ghost" size="icon-xs" onClick={() => updateQty(item.id_producto, -1)} disabled={item.cantidad <= 1}><Minus className="size-3" /></Button>
                                    <span className="text-xs font-bold w-6 text-center">{item.cantidad}</span>
                                    <Button variant="ghost" size="icon-xs" onClick={() => updateQty(item.id_producto, 1)} disabled={item.cantidad >= item.stock}><Plus className="size-3" /></Button>
                                </div>
                                <Button variant="ghost" size="icon-sm" onClick={() => { setCart(removeCartItem(item.id_producto)); }} className="text-destructive"><Trash2 className="size-4" /></Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="space-y-6">
                    <Card className="bg-card border-border rounded-xl shadow-xs p-6 h-fit sticky top-6">
                        <CardContent className="p-0 space-y-4">
                            <h3 className="text-lg font-bold tracking-tight">Resumen del Pedido</h3>
                            <div className="flex justify-between text-sm"><span>Subtotal</span><span>{subtotal.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</span></div>
                            
                            {/* Checkbox de pago */}
                            <div className="flex items-center gap-2 py-2">
                                <input 
                                    type="checkbox" 
                                    id="pago" 
                                    className="size-4"
                                    checked={simularPago} 
                                    onChange={(e) => setSimularPago(e.target.checked)} 
                                />
                                <label htmlFor="pago" className="text-sm cursor-pointer">Simular pago completado</label>
                            </div>

                            <Separator />
                            <div className="flex justify-between items-baseline font-bold">
                                <span>Total</span>
                                <span className="text-2xl text-primary">{(subtotal + envio).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</span>
                            </div>
                            <Button onClick={handlePay} className="w-full py-5 mt-4 font-bold rounded-xl flex items-center justify-center gap-2">
                                <CreditCard className="size-4" /> Tramitar Pedido
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <AppFooter />
        </div>
    );
}