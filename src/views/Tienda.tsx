import { useState, useEffect } from "react";
import { Search, Plus, ShoppingBag, SlidersHorizontal, Check } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { supabase } from "../utils/supabase";
import { AppFooter, AppHeader } from "../components/login";
import { addOrUpdateCartItem } from "../lib/cart";

// Tipado completo extendido con la relación de imágenes de tu TIENDA_DB.sql
interface ProductImage {
  url: string;
  es_portada: boolean;
}

interface Product {
  id_producto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  tipo: 'electronica' | 'ropa' | 'zapatillas' | 'hogar' | 'deporte' | 'belleza' | 'otros';
  marca: 'nike' | 'apple' | 'zara' | 'samsung' | 'adidas' | 'pull_and_bear' | 'otras';
  imagen_producto?: ProductImage[];
}

export default function Tienda() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [addedItems, setAddedItems] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      // Traemos los productos e incluimos sus imágenes relacionadas en una sola consulta eficiente
      const { data, error } = await supabase.from("producto").select("*, imagen_producto(url, es_portada)");
      
      if (!error && data) {
        setProducts(data as Product[]);
      }
    } catch (err) {
      console.error("Error cargando productos:", err);
    } finally {
      setLoading(false);
    }
  }

  // Lógica del botón + (Añadir al carrito con feedback visual instantáneo)
  const handleAddToCart = (productId: number) => {
    const product = products.find((item) => item.id_producto === productId);
    if (!product) return;

    addOrUpdateCartItem({
      id_producto: product.id_producto,
      nombre: product.nombre,
      precio: product.precio,
      marca: product.marca,
      stock: product.stock,
      cantidad: 1,
      imagen_url: product.imagen_producto?.find((img) => img.es_portada)?.url || product.imagen_producto?.[0]?.url,
    });

    setAddedItems((prev) => ({ ...prev, [productId]: true }));

    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [productId]: false }));
    }, 1500);
  };

  // Filtrado combinado en cliente (Buscador + Selector de Categoría)
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.nombre.toLowerCase().includes(search.toLowerCase()) || 
                          product.marca.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.tipo === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categorias = ["electronica", "ropa", "zapatillas", "hogar", "deporte", "belleza", "otros"];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <AppHeader />
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Barra superior de Herramientas, Filtros y Búsqueda */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-xl border border-border shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por zapatillas, marcas, modelos..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="pl-9 bg-background border-border"
          />
        </div>
        
        {/* Filtros horizontales en Badge scrollable */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          <SlidersHorizontal className="size-4 text-muted-foreground shrink-0 hidden md:block" />
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
            className="capitalize rounded-full cursor-pointer text-xs shrink-0"
          >
            Todos
          </Button>
          {categorias.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="capitalize rounded-full cursor-pointer text-xs shrink-0"
            >
              {cat.replace("_", " ")}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid del Catálogo de Productos */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl aspect-[3/4] animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <ShoppingBag className="size-12 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-semibold">No se encontraron productos</h3>
          <p className="text-sm text-muted-foreground mt-1">Prueba a cambiar los términos de búsqueda o filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            // Buscamos la imagen marcada como portada, o usamos la primera que encontremos
            const portada = product.imagen_producto?.find((img) => img.es_portada)?.url || 
                            product.imagen_producto?.[0]?.url;

            return (
              <Card 
                key={product.id_producto} 
                className="group relative flex flex-col justify-between bg-card border-border overflow-hidden rounded-xl shadow-xs hover:shadow-md transition-all duration-300"
              >
                {/* Imagen del Producto con Contenedor estandarizado */}
                <div className="relative aspect-square w-full bg-muted overflow-hidden flex items-center justify-center">
                  {portada ? (
                    <img 
                      src={portada} 
                      alt={product.nombre} 
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    // Fallback estético si el producto no tiene fotos asignadas
                    <div className="flex flex-col items-center justify-center text-muted-foreground text-xs font-medium uppercase p-4 select-none">
                      <ShoppingBag className="size-8 mb-2 opacity-40" />
                      {product.marca}
                    </div>
                  )}

                  {/* Badge de Stock Bajo flotante */}
                  {product.stock <= 5 && (
                    <Badge variant="destructive" className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 shadow-xs">
                      {product.stock === 0 ? "Agotado" : "Últimas unidades"}
                    </Badge>
                  )}
                </div>

                {/* Detalles y Cuerpo del Producto */}
                <CardContent className="p-4 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block capitalize">
                      {product.marca.replace("_", " ")}
                    </span>
                    <h3 className="font-bold text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {product.nombre}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                      {product.descripcion}
                    </p>
                  </div>

                  {/* Fila de Precio y Acción del Carrito */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground font-medium">Precio</span>
                      <span className="text-xl font-black text-foreground tracking-tight">
                        {product.precio.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                      </span>
                    </div>

                    {/* Botón interactivo + */}
                    <Button
                      size="icon-sm"
                      disabled={product.stock === 0}
                      onClick={() => handleAddToCart(product.id_producto)}
                      className={`rounded-xl cursor-pointer transition-all duration-200 shadow-xs active:scale-95 ${
                        addedItems[product.id_producto]
                          ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      }`}
                      title="Añadir al carrito"
                    >
                      {addedItems[product.id_producto] ? (
                        <Check className="size-4 animate-in fade-in zoom-in-75 duration-200" />
                      ) : (
                        <Plus className="size-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      </main>
      <AppFooter />
    </div>
  );
}