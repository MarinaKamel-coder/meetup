// src/app/(organizer)/tournaments/page.tsx
// src/app/(organizer)/tournaments/page.tsx
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import CreateTournamentForm from "@/components/CreateTournamentForm";

export default async function TournamentsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser || dbUser.role !== "ORGANIZER") redirect("/dashboard");

  const tournaments = await prisma.tournament.findMany({
    where: { organizerId: dbUser.id },
    include: { _count: { select: { teams: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 shadow-lg">
        <div className="absolute top-0 right-0 h-40 w-40 translate-x-8 -translate-y-8 rounded-full bg-emerald-500/20 blur-2xl" />
        <div className="relative z-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
            Gestion Organisateur
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">Mes tournois</h2>
          <p className="mt-2 text-slate-400">
            {tournaments.length} tournoi{tournaments.length > 1 ? "s" : ""} créé{tournaments.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Formulaire création */}
      <CreateTournamentForm />

      {/* Liste des tournois */}
      {tournaments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-4xl mb-3">🏆</p>
          <p className="text-base font-semibold text-slate-700">
            Aucun tournoi créé pour le moment
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Cliquez sur &quot;+ Créer un tournoi&quot; pour commencer.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tournaments.map((tournament) => (
            <Link
              key={tournament.id}
              href={`/tournaments/${tournament.id}`}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 mb-3">
                    {tournament.sport}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition">
                    {tournament.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">📍 {tournament.city}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    🗓 {new Date(tournament.startDate).toLocaleDateString("fr-CA", {
                      day: "numeric", month: "long", year: "numeric"
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-slate-900">
                    {tournament._count.teams}
                  </p>
                  <p className="text-xs text-slate-500">
                    équipe{tournament._count.teams > 1 ? "s" : ""}
                  </p>
                  {tournament.entryFee > 0 && (
                    <span className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                      💳 {(tournament.entryFee / 100).toFixed(2)} CAD
                    </span>
                  )}
                  {tournament.entryFee === 0 && (
                    <span className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                      Gratuit
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end">
                <span className="text-xs font-semibold text-emerald-600 opacity-0 group-hover:opacity-100 transition">
                  Voir les détails →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}