// src/app/(organizer)/dashboard/page.tsx
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser || dbUser.role !== "ORGANIZER") redirect("/");

  const [tournamentsCount, teamsCount, pendingRequestsCount, recentTournaments] =
    await Promise.all([
      prisma.tournament.count({ where: { organizerId: dbUser.id } }),
      prisma.team.count({ where: { tournament: { organizerId: dbUser.id } } }),
      prisma.joinRequest.count({
        where: {
          status: "PENDING",
          team: { tournament: { organizerId: dbUser.id } },
        },
      }),
      prisma.tournament.findMany({
        where: { organizerId: dbUser.id },
        include: { _count: { select: { teams: true } } },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
    ]);

  const stats = [
    {
      label: "Tournois",
      value: tournamentsCount,
      emoji: "🏆",
      color: "from-emerald-500 to-emerald-700",
      shadow: "shadow-emerald-500/20",
      href: "/tournaments",
    },
    {
      label: "Équipes",
      value: teamsCount,
      emoji: "👥",
      color: "from-blue-500 to-blue-700",
      shadow: "shadow-blue-500/20",
      href: "/tournaments",
    },
    {
      label: "En attente",
      value: pendingRequestsCount,
      emoji: "⏳",
      color: "from-amber-500 to-amber-700",
      shadow: "shadow-amber-500/20",
      href: "/requests",
    },
  ];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 shadow-lg">
        <div className="absolute top-0 right-0 h-48 w-48 translate-x-12 -translate-y-12 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-32 w-32 -translate-x-8 translate-y-8 rounded-full bg-blue-500/10 blur-2xl" />
        <div className="relative z-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
            Dashboard
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            Bonjour, {dbUser.fullName.split(" ")[0]} 👋
          </h2>
          <p className="mt-2 text-slate-400 max-w-xl">
            Gérez vos tournois, équipes et demandes depuis votre espace organisateur.
          </p>
        </div>
      </div>

      {/* Alerte demandes en attente */}
      {pendingRequestsCount > 0 && (
        <Link href="/requests" className="block">
          <div className="rounded-2xl border border-amber-300/50 bg-gradient-to-r from-amber-500/10 to-amber-600/5 p-5 flex items-center justify-between hover:from-amber-500/20 transition">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-2xl">
                ⏳
              </div>
              <div>
                <p className="font-bold text-slate-900">
                  {pendingRequestsCount} demande{pendingRequestsCount > 1 ? "s" : ""} en attente
                </p>
                <p className="text-sm text-slate-500">
                  Cliquez pour les accepter ou refuser
                </p>
              </div>
            </div>
            <span className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition hover:bg-amber-400">
              Voir →
            </span>
          </div>
        </Link>
      )}

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.color} p-6 shadow-lg ${stat.shadow} transition hover:scale-[1.02]`}>
              <div className="absolute top-0 right-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-white/10 blur-xl" />
              <div className="relative z-10">
                <p className="text-3xl mb-2">{stat.emoji}</p>
                <p className="text-4xl font-black text-white">{stat.value}</p>
                <p className="mt-1 text-sm font-semibold text-white/80">{stat.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">

        {/* Tournois récents */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">
              Tournois récents
            </h3>
            <Link
              href="/tournaments"
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-500 transition"
            >
              Voir tout →
            </Link>
          </div>

          {recentTournaments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
              <p className="text-3xl mb-3">🏟️</p>
              <p className="text-sm font-semibold text-slate-700">
                Aucun tournoi créé
              </p>
              <Link
                href="/tournaments"
                className="mt-4 inline-block rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500"
              >
                Créer mon premier tournoi
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 hover:border-emerald-200 hover:bg-emerald-50/50 transition"
                >
                  <div>
                    <p className="font-bold text-slate-900">{tournament.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {tournament.sport} • {tournament.city}
                    </p>
                  </div>
                  <span className="rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                    {tournament._count.teams} équipe{tournament._count.teams > 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions rapides */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Actions rapides</h3>

          {[
            {
              href: "/tournaments",
              emoji: "🏆",
              title: "Créer un tournoi",
              description: "Lancez une nouvelle compétition",
              color: "hover:border-emerald-300 hover:bg-emerald-50",
            },
            {
              href: "/requests",
              emoji: "📋",
              title: "Gérer les demandes",
              description: "Validez les candidatures",
              color: "hover:border-blue-300 hover:bg-blue-50",
            },
            {
              href: "/tournaments",
              emoji: "👥",
              title: "Gérer les équipes",
              description: "Suivez vos équipes",
              color: "hover:border-purple-300 hover:bg-purple-50",
            },
          ].map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className={`flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition ${action.color}`}
            >
              <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0">
                {action.emoji}
              </div>
              <div>
                <p className="font-bold text-slate-900">{action.title}</p>
                <p className="text-xs text-slate-500">{action.description}</p>
              </div>
              <span className="ml-auto text-slate-400">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}