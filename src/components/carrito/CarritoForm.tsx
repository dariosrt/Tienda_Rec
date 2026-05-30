import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "../ui/sheet";

// Tipos extraídos de los ENUMS de tu TIENDA_DB.sql
export interface Producto {
  id_producto?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  tipo: 'electronica' | 'ropa' | 'zapatillas' | 'hogar' | 'deporte' | 'belleza' | 'otros';
  marca: 'nike' | 'apple' | 'zara' | 'samsung' | 'adidas' | 'pull_and_bear' | 'otras';
}

interface ProductFormSheetProps {
  productoEditando: Producto | null;
  onSave: (producto: Producto) => Promise<void>;
}

export function ProductFormSheet({ productoEditando, onSave }: ProductFormSheetProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Producto>({
    nombre: "",
    descripcion: "",
    precio: 0,
    stock: 0,
    tipo: "otros",
    marca: "otras",
  });

  useEffect(() => {
    if (productoEditando) {
      setFormData(productoEditando);
    } else {
      setFormData({ nombre: "", descripcion: "", precio: 0, stock: 0, tipo: "otros", marca: "otras" });
    }
  }, [productoEditando]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await onSave(formData);
    setLoading(false);
  }

  // Clases compartidas para imitar perfectamente la estética de tu input.tsx en otros elementos
  const inputEstiloBase = "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm text-foreground";

  return (
    <SheetContent side="right" className="w-full sm:max-w-[450px] flex flex-col justify-between bg-card text-card-foreground border-l border-border">
      <div>
        <SheetHeader className="pb-4">
          <SheetTitle className="text-xl font-bold">{productoEditando ? "Editar Producto" : "Nuevo Producto"}</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            {productoEditando ? "Modifica las propiedades de este artículo." : "Añade un nuevo artículo al catálogo general de la tienda."}
          </SheetDescription>
        </SheetHeader>

        <form id="product-form" onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="nombre">Nombre</label>
            <Input id="nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} placeholder="Ej. Air Max 90" required disabled={loading} />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="descripcion">Descripción</label>
            <textarea id="descripcion" className={`${inputEstiloBase} h-20 resize-none py-2`} value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} placeholder="Breve descripción del artículo..." required disabled={loading} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor="precio">Precio (€)</label>
              <Input id="precio" type="number" step="0.01" min="0" value={formData.precio || ""} onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })} placeholder="0.00" required disabled={loading} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor="stock">Stock</label>
              <Input id="stock" type="number" min="0" value={formData.stock || ""} onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} placeholder="0" required disabled={loading} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor="tipo">Categoría</label>
              <select id="tipo" className={inputEstiloBase} value={formData.tipo} onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })} disabled={loading}>
                <option value="electronica">Electrónica</option>
                <option value="ropa">Ropa</option>
                <option value="zapatillas">Zapatillas</option>
                <option value="hogar">Hogar</option>
                <option value="deporte">Deporte</option>
                <option value="belleza">Belleza</option>
                <option value="otros">Otros</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor="marca">Marca</label>
              <select id="marca" className={inputEstiloBase} value={formData.marca} onChange={(e) => setFormData({ ...formData, marca: e.target.value as any })} disabled={loading}>
                <option value="nike">Nike</option>
                <option value="apple">Apple</option>
                <option value="zara">Zara</option>
                <option value="samsung">Samsung</option>
                <option value="adidas">Adidas</option>
                <option value="pull_and_bear">Pull & Bear</option>
                <option value="otras">Otras</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      <SheetFooter className="border-t border-border pt-4">
        <SheetClose asChild>
          <Button variant="outline" disabled={loading}>Cancelar</Button>
        </SheetClose>
        <Button type="submit" form="product-form" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {loading ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </SheetFooter>
    </SheetContent>
  );
}