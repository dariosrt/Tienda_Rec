export function LoginHero() {
  return (
    <div className="relative hidden w-1/2 flex-col justify-end bg-zinc-950 p-12 text-white lg:flex">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

      <div className="relative z-10 max-w-md">
        <h2 className="mb-4 text-3xl font-bold tracking-tight">Elevate Your Retail Experience.</h2>
        <p className="text-zinc-400">
          Access your ShopSphere dashboard to manage inventory, track performance, and engage with your customers seamlessly.
        </p>
      </div>
    </div>
  )
}
