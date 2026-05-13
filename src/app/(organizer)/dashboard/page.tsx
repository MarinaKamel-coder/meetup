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

  // Stats réelles depuis Prisma
  const [tournamentsCount, teamsCount, pendingRequestsCount, recentTournaments] =
    await Promise.all([
      prisma.tournament.count({ where: { organizerId: dbUser.id } }),
      prisma.team.count({
        where: { tournament: { organizerId: dbUser.id } },
      }),
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
      label: "Tournois créés",
      value: tournamentsCount.toString(),
      description: "Compétitions actuellement gérées",
    },
    {
      label: "Équipes inscrites",
      value: teamsCount.toString(),
      description: "Équipes actuellement enregistrées",
    },
    {
      label: "Demandes en attente",
      value: pendingRequestsCount.toString(),
      description: "Candidatures à traiter",
    },
  ];

  const quickActions = [
    {
      title: "Créer un tournoi",
      description: "Lancez une nouvelle compétition et ouvrez les inscriptions",
      href: "/tournaments",
    },
    {
      title: "Gérer les demandes",
      description: "Consultez et validez les demandes d'adhésion des joueurs",
      href: "/requests",
    },
  ];

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">
            Dashboard
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Bonjour, {dbUser.fullName.split(" ")[0]} 👋
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
            Suivez vos tournois, vos équipes et les demandes des joueurs.
          </p>
        </div>

        <Link
          href="/tournaments"
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Gérer mes tournois
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm transition hover:shadow-md"
          >
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
              {stat.value}
            </p>
            <p className="mt-2 text-sm text-slate-600">{stat.description}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        {/* Tournois récents */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-900">
              Mes tournois récents
            </h3>
            <Link
              href="/tournaments"
              className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
            >
              Voir tout →
            </Link>
          </div>

          {recentTournaments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-base font-medium text-slate-700">
                Aucun tournoi créé pour le moment
              </p>
              <Link
                href="/tournaments"
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                Créer mon premier tournoi
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{tournament.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {tournament.sport} • {tournament.city}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {tournament._count.teams} équipe{tournament._count.teams > 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions rapides */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Actions rapides
            </h3>
            <div className="mt-4 space-y-4">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="block rounded-xl border border-slate-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50"
                >
                  <p className="font-semibold text-slate-900">{action.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{action.description}</p>
                </Link>
              ))}
            </div>
          </div>

          {pendingRequestsCount > 0 && (
            <Link
              href="/requests"
              className="block rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm transition hover:bg-amber-100"
            >
              <p className="text-sm uppercase tracking-widest text-amber-600 font-medium">
                Action requise
              </p>
              <p className="mt-2 text-xl font-bold text-slate-900">
                {pendingRequestsCount} demande{pendingRequestsCount > 1 ? "s" : ""} en attente
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Cliquez pour les traiter →
              </p>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}