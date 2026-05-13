import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight">
        Plateforme de Gestion de Ligues Sportives
      </h1>

      <p className="mt-4 max-w-2xl text-lg text-slate-600">
        Connecter organisateurs et joueurs passionnés autour de tournois et d&apos;équipes sportives communautaires.
      </p>

      <div className="mt-8 flex gap-4">
        <Link
          href="/sign-in"
          className="rounded-md bg-slate-900 px-5 py-3 text-white transition hover:bg-slate-700"
        >
          Inscription
        </Link>
      </div>  
    </main>
  );
}