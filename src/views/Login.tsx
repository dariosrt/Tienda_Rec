import { LoginForm, LoginHero, AppFooter, AppHeader } from "../components/login"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <AppHeader />

      <main className="flex flex-1 overflow-hidden">
        <LoginHero />
        <LoginForm />
      </main>

      <AppFooter />
    </div>
  )
}
