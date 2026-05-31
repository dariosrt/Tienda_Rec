import { useEffect, useState } from "react"
import { Menu, ShoppingCart, User } from "lucide-react"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Button } from "../ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "../ui/sheet"
import { supabase } from "../../utils/supabase"
import { Link } from "react-router-dom"

const navLinks = [
  { href: "/", label: "Tienda" },
  { href: "/carrito", label: "Carrito" },
  { href: "/mis-reservas", label: "Mis Reservas" },
];

const checkIsAdmin = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("usuario")
    .select("rol")
    .eq("id_usuario", user.id)
    .single();

  return data?.rol === "admin";
};

export function AppHeader() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Carga inicial y escucha de cambios
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
      // Solo comprobamos admin si hay usuario
      if (user) {
        checkIsAdmin().then(setIsAdmin);
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) checkIsAdmin().then(setIsAdmin);
      else setIsAdmin(false);
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b px-6 bg-background text-foreground">
      <div className="flex items-center gap-4 md:gap-8">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground cursor-pointer">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle className="text-left">ShopSphere</SheetTitle>
              <SheetDescription className="hidden">Menú de navegación</SheetDescription>
            </SheetHeader>
            <nav className="flex flex-col gap-4 mt-6 text-sm font-medium text-muted-foreground">
              {navLinks.map((link) => (
                <Link key={link.label} to={link.href} className="hover:text-foreground">{link.label}</Link>
              ))}
              {isAdmin && (
                <>
                  <Link to="/admin/gestion-usuarios" className="font-bold text-primary">Gestionar Usuarios</Link>
                  <Link to="/admin/gestion-productos" className="font-bold text-primary">Gestionar Productos</Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">S</div>

        <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
          {navLinks.map((link) => (
            <Link key={link.label} to={link.href} className="hover:text-foreground">{link.label}</Link>
          ))}
          {isAdmin && (
            <>
              <Link to="/admin/gestion-usuarios" className="font-bold text-primary">Usuarios</Link>
              <Link to="/admin/gestion-productos" className="font-bold text-primary">Productos</Link>
            </>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {loading ? (
          <div className="size-8 rounded-full bg-muted animate-pulse" />
        ) : user ? (
          <>
            <Link to="/carrito" className="text-muted-foreground hidden sm:inline-flex cursor-pointer">
              <ShoppingCart className="size-5" />
            </Link>
            <Link to="/perfil">
              <Avatar className="cursor-pointer hover:opacity-80 transition-opacity border border-border">
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold uppercase text-xs">
                  {user.user_metadata?.nombre?.slice(0, 2) || <User className="size-4" />}
                </AvatarFallback>
              </Avatar>
            </Link>
          </>
        ) : (
          <Button asChild variant="default" className="cursor-pointer">
            <Link to="/login">Iniciar Sesión</Link>
          </Button>
        )}
      </div>
    </header>
  )
}