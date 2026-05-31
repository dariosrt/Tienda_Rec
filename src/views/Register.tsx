import { RegisterForm } from "../components/register/RegisterForm"; // Ajusta la ruta
import { LoginHero, AppFooter, AppHeader } from "../components/login"; 

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <AppHeader />

      <main className="flex flex-1 overflow-hidden">
        <LoginHero /> 
        <RegisterForm />
      </main>

      <AppFooter />
    </div>
  )
}