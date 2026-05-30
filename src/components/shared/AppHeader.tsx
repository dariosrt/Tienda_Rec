import { useState, useEffect } from "react"
import { Bell, Menu, ShoppingCart, User } from "lucide-react"

// Importamos AvatarImage junto con los demás subcomponentes
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar"
import { Button } from "../ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet"
import { supabase } from "../../utils/supabase" // Ajusta esta ruta según tu estructura
import { Link } from "react-router-dom"

const navLinks = [
  { href: "/", label: "Tienda" },
]

export function AppHeader() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Comprobar si hay un usuario logueado al cargar el componente
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // 2. Escuchar cambios de estado en tiempo real (Login, Logout, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
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
            </SheetHeader>
            <nav className="flex flex-col gap-4 mt-6 text-sm font-medium text-muted-foreground">
              {navLinks.map((link) => (
                <a key={link.label} href={link.href} className="hover:text-foreground">
                  {link.label}
                </a>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
          S
        </div>

        <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="hover:text-foreground">
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Bloque Condicional de Autenticación */}
      <div className="flex items-center gap-2 md:gap-4">
        {loading ? (
          // Estado de carga ligero para evitar parpadeos visuales molestos
          <div className="size-8 rounded-full bg-muted animate-pulse" />
        ) : user ? (
          // SI EL USUARIO ESTÁ REGISTRADO/LOGUEADO: Muestra carrito, notificaciones y perfil
          <>
            <Link to="/carrito" className="text-muted-foreground hidden sm:inline-flex cursor-pointer">
              <ShoppingCart className="size-5" />
            </Link>

            <Avatar className="cursor-pointer hover:opacity-80 transition-opacity border border-border">
              {/* Intentamos cargar la imagen de los metadatos de Supabase Auth */}
              {user.user_metadata?.avatar_url ? (
                <AvatarImage 
                  src={user.user_metadata.imagen_url} 
                  alt={user.user_metadata?.nombre || "Avatar de usuario"} 
                />
              ) : null}
              
              {/* Si la imagen falla o no tiene, ponemos las iniciales de su nombre o el icono por defecto */}
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold uppercase text-xs">
                {user.user_metadata?.nombre ? (
                  user.user_metadata.nombre.slice(0, 2)
                ) : (
                  <User className="size-4" />
                )}
              </AvatarFallback>
            </Avatar>
          </>
        ) : (
          // SI EL USUARIO NO ESTÁ LOGUEADO: Muestra el botón de inicio de sesión
          <Button asChild variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs">
            <a href="/login">Iniciar Sesión</a>
          </Button>
        )}
      </div>
    </header>
  )
}