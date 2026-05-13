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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Équipes disponibles</h2>
        <p className="text-sm text-slate-500 mt-1">
          Trouvez une équipe et envoyez une demande d&apos;adhésion.
        </p>
      </div>

      {teams.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-base font-medium text-slate-700">
            Aucune équipe disponible pour le moment.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => {
            const spotsLeft = team.maxCapacity - team._count.members;
            const isFull = spotsLeft <= 0;

            return (
              <Link
                key={team.id}
                href={`/teams/${team.id}`}
                className={`block rounded-2xl border p-5 transition hover:shadow-md ${
                  isFull
                    ? "border-slate-200 bg-slate-50 opacity-60"
                    : "border-slate-200 bg-white hover:border-emerald-300"
                }`}
              >
                {/* Sport badge */}
                <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {team.tournament.sport}
                </span>

                {/* Nom équipe */}
                <h3 className="mt-3 text-lg font-bold text-slate-900">
                  {team.name}
                </h3>

                {/* Tournoi */}
                <p className="mt-1 text-sm text-slate-500">
                  {team.tournament.name}
                </p>

                {/* Ville */}
                <p className="mt-1 text-xs text-slate-400">
                  📍 {team.tournament.city}
                </p>

                {/* Places */}
                <div className="mt-4 flex items-center justify-between">
                  <span
                    className={`text-sm font-medium ${
                      isFull ? "text-red-500" : "text-emerald-600"
                    }`}
                  >
                    {isFull ? "Complet" : `${spotsLeft} place${spotsLeft > 1 ? "s" : ""} disponible${spotsLeft > 1 ? "s" : ""}`}
                  </span>
                  <span className="text-xs text-slate-400">
                    {team._count.members} / {team.maxCapacity}
                  </span>
                </div>

                {/* Frais */}
                {team.tournament.entryFee > 0 && (
                  <p className="mt-2 text-xs font-medium text-amber-600">
                    💳 Frais : {(team.tournament.entryFee / 100).toFixed(2)} CAD
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}