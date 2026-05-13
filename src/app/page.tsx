// src/app/page.tsx
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (dbUser?.role === "ORGANIZER") redirect("/dashboard");
    if (dbUser?.role === "ADMIN") redirect("/admin");
    if (dbUser?.role === "PLAYER") redirect("/profile");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white overflow-hidden">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <span className="text-xl font-bold tracking-tight text-white">
              Meetup Sportif
            </span>
            <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400">
              Beta
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white"
            >
              Se connecter
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400"
            >
              S&apos;inscrire
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">

        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute top-1/3 left-1/4 h-64 w-64 rounded-full bg-slate-500/20 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-emerald-700/20 blur-3xl" />

        <div className="relative z-10 max-w-4xl">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Plateforme communautaire de ligues sportives
          </div>

          {/* Title */}
          <h1 className="text-5xl font-black tracking-tight md:text-7xl">
            Trouvez votre{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              équipe
            </span>
            .{" "}
            <br />
            Jouez ensemble.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 md:text-xl">
            Connectez organisateurs et joueurs passionnés autour de tournois
            et d&apos;équipes sportives communautaires.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/sign-up"
              className="group relative inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 hover:shadow-emerald-400/30"
            >
              Commencer gratuitement
              <span className="transition group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              Se connecter
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500">
          <span className="text-xs uppercase tracking-widest">Découvrir</span>
          <div className="h-8 w-px bg-gradient-to-b from-slate-500 to-transparent" />
        </div>
      </section>

      {/* Features */}
      <section className="relative bg-slate-900/50 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
              Fonctionnalités
            </p>
            <h2 className="mt-3 text-4xl font-bold text-white">
              Tout ce dont vous avez besoin
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: "🏆",
                title: "Tournois",
                description: "Créez et gérez vos compétitions sportives avec un système complet d'inscription et de paiement.",
              },
              {
                icon: "⚡",
                title: "Équipes",
                description: "Formez des équipes, gérez les adhésions et suivez la progression de vos joueurs.",
              },
              {
                icon: "📅",
                title: "Matchs",
                description: "Planifiez vos rencontres, enregistrez les scores et suivez le classement en temps réel.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur transition hover:border-emerald-500/30 hover:bg-white/10"
              >
                <div className="mb-4 text-4xl">{feature.icon}</div>
                <h3 className="mb-2 text-xl font-bold text-white">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-slate-900/50 p-12 text-center backdrop-blur">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Prêt à rejoindre la communauté ?
            </h2>
            <p className="mt-4 text-slate-400">
              Inscrivez-vous en tant que joueur ou organisateur et commencez dès aujourd&apos;hui.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/sign-up"
                className="rounded-xl bg-emerald-500 px-8 py-4 text-base font-bold text-white transition hover:bg-emerald-400"
              >
                Je suis joueur →
              </Link>
              <Link
                href="/sign-up"
                className="rounded-xl border border-white/20 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10"
              >
                Je suis organisateur →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-slate-500">
        <p>© 2026 Meetup Sportif — Projet Hackathon 48h</p>
      </footer>

    </main>
  );
}