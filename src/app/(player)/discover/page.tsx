// src/app/(player)/tournaments/page.tsx
import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function PlayerTournamentsPage() {
  const tournaments = await prisma.tournament.findMany({
    include: {
      organizer: { select: { fullName: true } },
      teams: {
        include: {
          _count: { select: { members: true } },
        },
      },
      _count: { select: { teams: true } },
    },
    orderBy: { startDate: "asc" },
  });

  const sportEmojis: Record<string, string> = {
    soccer: "⚽", football: "🏈", basketball: "🏀",
    volleyball: "🏐", tennis: "🎾", hockey: "🏒",
    baseball: "⚾", rugby: "🏉",
  };

  function getSportEmoji(sport: string) {
    const key = sport.toLowerCase();
    for (const [k, v] of Object.entries(sportEmojis)) {
      if (key.includes(k)) return v;
    }
    return "🏅";
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 shadow-lg">
        <div className="absolute top-0 right-0 h-40 w-40 translate-x-8 -translate-y-8 rounded-full bg-white/10 blur-2xl" />
        <div className="relative z-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-200">
            Espace Joueur
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">Tournois disponibles</h2>
          <p className="mt-2 text-emerald-100">
            {tournaments.length} tournoi{tournaments.length > 1 ? "s" : ""} — trouvez le vôtre et rejoignez une équipe !
          </p>
        </div>
      </div>

      {/* Liste */}
      {tournaments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <p className="text-4xl mb-4">🏟️</p>
          <p className="text-base font-semibold text-slate-700">
            Aucun tournoi disponible pour le moment.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Revenez bientôt — des tournois arrivent !
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {tournaments.map((tournament) => {
            const availableTeams = tournament.teams.filter(
              (t) => t._count.members < t.maxCapacity
            );

            return (
              <div
                key={tournament.id}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
              >
                {/* Barre de couleur en haut */}
                <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-emerald-600" />

                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Badge sport */}
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 mb-3">
                        {getSportEmoji(tournament.sport)} {tournament.sport}
                      </span>

                      {/* Nom */}
                      <h3 className="text-xl font-black text-slate-900">
                        {tournament.name}
                      </h3>

                      {/* Infos */}
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
                        <span>📍 {tournament.city}</span>
                        <span>🗓 {new Date(tournament.startDate).toLocaleDateString("fr-CA", {
                          day: "numeric", month: "long", year: "numeric"
                        })}</span>
                        <span>👤 Organisé par {tournament.organizer.fullName}</span>
                      </div>
                    </div>

                    {/* Frais */}
                    <div className="text-right shrink-0">
                      {tournament.entryFee === 0 ? (
                        <div className="rounded-xl bg-emerald-100 px-4 py-2 text-center">
                          <p className="text-lg font-black text-emerald-700">Gratuit</p>
                          <p className="text-xs text-emerald-600">inscription</p>
                        </div>
                      ) : (
                        <div className="rounded-xl bg-amber-100 px-4 py-2 text-center">
                          <p className="text-lg font-black text-amber-700">
                            {(tournament.entryFee / 100).toFixed(2)} CAD
                          </p>
                          <p className="text-xs text-amber-600">par joueur</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats équipes */}
                  <div className="mt-4 flex items-center gap-4 text-sm">
                    <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                      🏅 {tournament._count.teams} équipe{tournament._count.teams > 1 ? "s" : ""}
                    </span>
                    <span className={`rounded-full px-3 py-1 font-medium ${
                      availableTeams.length > 0
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {availableTeams.length > 0
                        ? `✅ ${availableTeams.length} équipe${availableTeams.length > 1 ? "s" : ""} avec places disponibles`
                        : "❌ Toutes les équipes sont complètes"}
                    </span>
                  </div>

                  {/* Équipes disponibles */}
                  {availableTeams.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
                        Équipes avec places disponibles
                      </p>
                      <div className="grid gap-2 md:grid-cols-2">
                        {availableTeams.map((team) => {
                          const spotsLeft = team.maxCapacity - team._count.members;
                          return (
                            <Link
                              key={team.id}
                              href={`/teams/${team.id}`}
                              className="group flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-emerald-300 hover:bg-emerald-50"
                            >
                              <div>
                                <p className="font-semibold text-slate-900 group-hover:text-emerald-700 transition">
                                  {team.name}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  {spotsLeft} place{spotsLeft > 1 ? "s" : ""} restante{spotsLeft > 1 ? "s" : ""}
                                </p>
                              </div>
                              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                                Rejoindre →
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}