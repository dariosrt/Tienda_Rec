import { useState, useEffect } from "react";
import { Minus, Plus, Trash2, ShoppingBag, CreditCard } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
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

    const getLoggedUserId = async (): Promise<string | null> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) return user.id;

        const tokenString = window.localStorage.getItem("supabase.auth.token");
        if (!tokenString) return null;

        try {
            const parsed = JSON.parse(tokenString);
            return parsed?.currentSession?.user?.id || parsed?.user?.id || null;
        } catch {
            return null;
        }
    };

    const handlePay = async () => {
        const orderTotal = subtotal + envio;
        if (orderTotal <= 0) return;

        const userId = await getLoggedUserId();
        if (!userId) {
            console.error("No se encontró usuario autenticado.");
            return;
        }

        const { error } = await supabase.from("pedido").insert([{
            id_usuario: userId,
            total: orderTotal,
            estado: "pagado",
            fecha: new Date().toISOString(),
        }]);

        if (error) {
            console.error("Error al crear el pedido:", error);
            return;
        }

        saveCart([]);
        setCart([]);
    }

    if (cart.length === 0) {
        return (
        <>
            <AppHeader />
            <div className="text-center py-16 bg-card rounded-xl border border-border max-w-md mx-auto mt-12">

                <ShoppingBag className="size-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold">Tu carrito está vacío</h3>
                <p className="text-sm text-muted-foreground mt-1">Explora la tienda para añadir productos.</p>
            </div>
        </>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
            <AppHeader />
            <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Lista de productos (Columna Izquierda) */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-2xl font-bold tracking-tight mb-6">Tu Carrito ({cart.length})</h2>
                    {cart.map((item) => (
                        <Card key={item.id_producto} className="bg-card border-border overflow-hidden rounded-xl shadow-xs py-4">
                            <CardContent className="flex items-center gap-4 p-0 px-4">
                                <img src={item.imagen_url} alt={item.nombre} className="size-16 sm:size-20 rounded-lg object-cover bg-muted shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">{item.marca}</span>
                                    <h3 className="font-bold text-sm sm:text-base line-clamp-1">{item.nombre}</h3>
                                    <p className="font-semibold text-sm mt-1">{(item.precio * item.cantidad).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</p>
                                </div>

                                {/* Controles rápidos de cantidad */}
                                <div className="flex items-center gap-1 bg-secondary rounded-lg p-1 shrink-0">
                                    <Button variant="ghost" size="icon-xs" onClick={() => updateQty(item.id_producto, -1)} disabled={item.cantidad <= 1} className="cursor-pointer size-7"><Minus className="size-3" /></Button>
                                    <span className="text-xs font-bold w-6 text-center">{item.cantidad}</span>
                                    <Button variant="ghost" size="icon-xs" onClick={() => updateQty(item.id_producto, 1)} disabled={item.cantidad >= item.stock} className="cursor-pointer size-7"><Plus className="size-3" /></Button>
                                </div>

                                {/* Eliminar item */}
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => {
                                        const nextCart = removeCartItem(item.id_producto);
                                        setCart(nextCart);
                                    }}
                                    className="text-destructive hover:bg-destructive/10 cursor-pointer rounded-lg shrink-0"
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Resumen Financiero (Columna Derecha / Sticky) */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold tracking-tight mb-6 hidden lg:block">&nbsp;</h2>
                    <Card className="bg-card border-border rounded-xl shadow-xs p-6 h-fit sticky top-6">
                        <CardContent className="p-0 space-y-4">
                            <h3 className="text-lg font-bold tracking-tight">Resumen del Pedido</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span className="font-medium">{subtotal.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</span></div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Envío</span>
                                    <span>{envio === 0 ? <Badge variant="secondary" className="text-emerald-600 bg-emerald-50/50 font-bold text-[11px]">Gratis</Badge> : envio.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</span>
                                </div>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-baseline pt-2">
                                <span className="text-base font-bold">Total</span>
                                <span className="text-2xl font-black tracking-tight text-primary">{(subtotal + envio).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</span>
                            </div>
                            <Button onClick={handlePay} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl py-5 mt-4 font-bold shadow-xs cursor-pointer flex items-center justify-center gap-2">
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