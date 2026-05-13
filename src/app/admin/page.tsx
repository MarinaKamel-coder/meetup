// src/app/admin/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser || dbUser.role !== "ADMIN") redirect("/");

  const tournaments = await prisma.tournament.findMany({
    include: {
      organizer: { select: { fullName: true, email: true } },
      teams: {
        include: {
          members: { select: { id: true, fullName: true } },
          _count: { select: { joinRequests: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalTeams = tournaments.reduce((acc, t) => acc + t.teams.length, 0);
  const totalPlayers = tournaments.reduce(
    (acc, t) => acc + t.teams.reduce((a, team) => a + team.members.length, 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-widest text-red-600">
            Administration
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Panneau d&apos;administration
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Vue globale de toute la plateforme.
          </p>
        </div>

        {/* Stats globales */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {[
            { label: "Tournois", value: tournaments.length },
            { label: "Équipes", value: totalTeams },
            { label: "Joueurs inscrits", value: totalPlayers },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="mt-2 text-4xl font-black text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Liste des tournois */}
        <div className="space-y-6">
          {tournaments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="text-sm text-slate-500">Aucun tournoi sur la plateforme.</p>
            </div>
          ) : (
            tournaments.map((tournament) => (
              <div
                key={tournament.id}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
              >
                {/* Header tournoi */}
                <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white text-lg">{tournament.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {tournament.sport} • {tournament.city} •{" "}
                      Organisé par {tournament.organizer.fullName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Frais</p>
                    <p className="text-sm font-semibold text-white">
                      {tournament.entryFee === 0
                        ? "Gratuit"
                        : `${(tournament.entryFee / 100).toFixed(2)} CAD`}
                    </p>
                  </div>
                </div>

                {/* Équipes */}
                <div className="p-6">
                  {tournament.teams.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">
                      Aucune équipe dans ce tournoi.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {tournament.teams.map((team) => {
                        const spotsLeft = team.maxCapacity - team.members.length;
                        return (
                          <div
                            key={team.id}
                            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                          >
                            {/* Header équipe */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <p className="font-semibold text-slate-900">
                                  {team.name}
                                </p>
                                <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                  {team.members.length} / {team.maxCapacity}
                                </span>
                                {spotsLeft <= 0 && (
                                  <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-600">
                                    Complet
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-400">
                                {team._count.joinRequests} demande{team._count.joinRequests > 1 ? "s" : ""}
                              </span>
                            </div>

                            {/* Membres */}
                            {team.members.length === 0 ? (
                              <p className="text-xs text-slate-400 italic">
                                Aucun membre.
                              </p>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {team.members.map((member) => (
                                  <span
                                    key={member.id}
                                    className="flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700"
                                  >
                                    <span className="h-5 w-5 rounded-full bg-slate-300 flex items-center justify-center text-xs font-bold text-slate-600">
                                      {member.fullName.charAt(0).toUpperCase()}
                                    </span>
                                    {member.fullName}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}