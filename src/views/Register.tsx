import { RegisterForm } from "../components/register/RegisterForm"; // Ajusta la ruta
import { LoginHero, AppFooter, AppHeader } from "../components/login"; 

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <AppHeader />

      <main className="flex flex-1 overflow-hidden">
        {/* Reutilizamos el Hero del Login para mantener consistencia visual sin escribir CSS extra */}
        <LoginHero /> 
        <RegisterForm />
      </main>

      <AppFooter />
    </div>
  )
}