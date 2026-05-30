export function AppFooter() {
  return (
    <footer className="flex flex-col items-center justify-between gap-4 border-t bg-background px-6 py-5 text-xs text-muted-foreground md:flex-row">
      <div>
        <span className="font-semibold text-foreground mr-2">ShopDario</span>
        © 2026 ShopDario Inc. Todos los derechos reservados (para mi).
      </div>
      <div className="flex gap-6">
        <a href="#" className="hover:text-foreground">
          Políticade privacidad
        </a>
        <a href="#" className="hover:text-foreground">
          Términos de servicio
        </a>
        <a href="#" className="hover:text-foreground">
          Ayuda
        </a>
        <a href="#" className="hover:text-foreground">
          Contacto
        </a>
      </div>
    </footer>
  )
}
