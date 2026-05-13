// src/app/(player)/teams/page.tsx
import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function TeamsPage() {
  const teams = await prisma.team.findMany({
    include: {
      tournament: {
        select: { name: true, sport: true, city: true, entryFee: true },
      },
      _count: {
        select: { members: true },
      },
    },
    orderBy: { createdAt: "desc" },
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
        <div className="absolute bottom-0 left-0 h-32 w-32 -translate-x-4 translate-y-4 rounded-full bg-black/20 blur-2xl" />
        <div className="relative z-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-200">
            Espace Joueur
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            Équipes disponibles
          </h2>
          <p className="mt-2 text-emerald-100">
            {teams.length} équipe{teams.length > 1 ? "s" : ""} — trouvez la vôtre et rejoignez l&apos;aventure !
          </p>
        </div>
      </div>

      {/* Liste */}
      {teams.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <p className="text-4xl mb-4">🏟️</p>
          <p className="text-base font-semibold text-slate-700">
            Aucune équipe disponible pour le moment.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Revenez bientôt — des tournois arrivent !
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => {
            const spotsLeft = team.maxCapacity - team._count.members;
            const isFull = spotsLeft <= 0;
            const fillPercent = Math.round((team._count.members / team.maxCapacity) * 100);

            return (
              <Link
                key={team.id}
                href={`/teams/${team.id}`}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border transition hover:shadow-lg ${
                  isFull
                    ? "border-slate-200 bg-slate-50 opacity-70"
                    : "border-slate-200 bg-white hover:border-emerald-300 hover:shadow-emerald-100"
                }`}
              >
                {/* Top color bar */}
                <div className={`h-1.5 w-full ${isFull ? "bg-red-400" : "bg-gradient-to-r from-emerald-400 to-emerald-600"}`} />

                <div className="flex flex-1 flex-col p-6">
                  {/* Sport badge + emoji */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {getSportEmoji(team.tournament.sport)} {team.tournament.sport}
                    </span>
                    {team.tournament.entryFee > 0 && (
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        💳 {(team.tournament.entryFee / 100).toFixed(2)} CAD
                      </span>
                    )}
                    {team.tournament.entryFee === 0 && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                        Gratuit
                      </span>
                    )}
                  </div>

                  {/* Nom équipe */}
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition">
                    {team.name}
                  </h3>

                  {/* Tournoi */}
                  <p className="mt-1 text-sm text-slate-500 truncate">
                    🏆 {team.tournament.name}
                  </p>

                  {/* Ville */}
                  <p className="mt-0.5 text-xs text-slate-400">
                    📍 {team.tournament.city}
                  </p>

                  {/* Progress bar places */}
                  <div className="mt-5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-sm font-semibold ${isFull ? "text-red-500" : "text-emerald-600"}`}>
                        {isFull ? "Complet" : `${spotsLeft} place${spotsLeft > 1 ? "s" : ""} libre${spotsLeft > 1 ? "s" : ""}`}
                      </span>
                      <span className="text-xs text-slate-400">
                        {team._count.members} / {team.maxCapacity}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isFull ? "bg-red-400" : fillPercent > 75 ? "bg-amber-400" : "bg-emerald-500"
                        }`}
                        style={{ width: `${fillPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Voir détails */}
                  <div className="mt-4 flex items-center justify-end">
                    <span className="text-xs font-semibold text-emerald-600 opacity-0 group-hover:opacity-100 transition">
                      Voir les détails →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}