import { useState, useEffect } from "react";
import { Plus, Search, Pencil, Trash2, Package, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Sheet, SheetTrigger } from "../components/ui/sheet";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { ProductFormSheet, Producto } from "../components/carrito/CarritoForm";
import { supabase } from "../utils/supabase";
import { AppFooter, AppHeader } from "../components/login";

export default function ItemsManagementContent() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    fetchProductos();
  }, []);

  async function fetchProductos() {
    const { data, error } = await supabase.from("producto").select("*").order("id_producto", { ascending: false });
    if (!error && data) setProductos(data);
  }

  async function handleSaveProducto(formData: Producto) {
    if (formData.id_producto) {
      await supabase.from("producto").update(formData).eq("id_producto", formData.id_producto);
    } else {
      await supabase.from("producto").insert([formData]);
    }
    await fetchProductos();
    setSheetOpen(false);
  }

  async function handleDelete(id: number) {
    if (confirm("¿Estás seguro de eliminar este producto de forma permanente?")) {
      await supabase.from("producto").delete().eq("id_producto", id);
      await fetchProductos();
    }
  }

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.marca.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.tipo.toLowerCase().includes(busqueda.toLowerCase())
  );

  // KPIs Calculados dinámicamente
  const totalItems = productos.length;
  const stockBajo = productos.filter((p) => p.stock <= 5).length;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <AppHeader />
      <main className="flex-1 w-full space-y-6 p-6 sm:p-8">
      
      {/* Zona Superior de Encabezado de la Sección */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Items</h1>
          <p className="text-sm text-muted-foreground">Controla el inventario público, actualiza stocks críticos y gestiona precios de artículos.</p>
        </div>
        
        {/* Controles de inserción unificados con tu Sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button onClick={() => setProductoEditando(null)} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shadow-xs cursor-pointer">
              <Plus className="size-4" /> Añadir Producto
            </Button>
          </SheetTrigger>
          <ProductFormSheet productoEditando={productoEditando} onSave={handleSaveProducto} />
        </Sheet>
      </div>

      <Separator />

      {/* Grid de Cuadros de Métricas (Reutilizando Card.tsx) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Catálogo Activo</CardTitle>
            <Package className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Modelos únicos listados</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Alertas de Stock</CardTitle>
            <AlertTriangle className="size-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stockBajo}</div>
            <p className="text-xs text-muted-foreground">Artículos con 5 unidades o menos</p>
          </CardContent>
        </Card>

      </div>

      {/* Sección del buscador */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input placeholder="Filtrar por nombre, marca o categoría..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="pl-9 bg-card border-border" />
      </div>

      {/* Tabla limpia con diseño Shadcn nativo */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-muted/40 text-muted-foreground border-b border-border text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 font-semibold">Detalle del Producto</th>
                <th className="p-4 font-semibold">Categoría</th>
                <th className="p-4 font-semibold">Precio</th>
                <th className="p-4 font-semibold">Disponibilidad</th>
                <th className="p-4 font-semibold text-right">Mantenimiento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground bg-background/50">
                    No se encuentran items que coincidan con los criterios de búsqueda.
                  </td>
                </tr>
              ) : (
                productosFiltrados.map((prod) => (
                  <tr key={prod.id_producto} className="hover:bg-muted/20 transition-colors">
                    {/* Nombre y Marca usando Avatar */}
                    <td className="p-4 flex items-center gap-3">
                      <Avatar className="size-9 border border-border">
                        <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold uppercase text-xs">
                          {prod.nombre.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="font-medium text-foreground block">{prod.nombre}</span>
                        <span className="text-xs text-muted-foreground capitalize">{prod.marca}</span>
                      </div>
                    </td>

                    {/* Badge de Categoría */}
                    <td className="p-4">
                      <Badge variant="secondary" className="capitalize text-xs font-normal">
                        {prod.tipo}
                      </Badge>
                    </td>

                    {/* Precio formateado */}
                    <td className="p-4 font-medium text-foreground">
                      {prod.precio.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                    </td>

                    {/* Nivel de Stock con Alerta */}
                    <td className="p-4">
                      {prod.stock <= 5 ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive bg-destructive/10 px-2.5 py-0.5 rounded-full">
                          {prod.stock} uds. escasas
                        </span>
                      ) : (
                        <span className="text-muted-foreground">{prod.stock} unidades</span>
                      )}
                    </td>

                    {/* Acciones CRUD */}
                    <td className="p-4 text-right space-x-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => { setProductoEditando(prod); setSheetOpen(true); }} className="hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer" title="Modificar artículo">
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => prod.id_producto && handleDelete(prod.id_producto)} className="hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer" title="Borrar artículo">
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
  );
}