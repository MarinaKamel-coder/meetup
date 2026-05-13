// src/app/(organizer)/tournaments/[id]/page.tsx
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import CreateMatchForm from "@/components/CreateMatchForm";

export default async function TournamentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser || dbUser.role !== "ORGANIZER") redirect("/dashboard");

  const tournament = await prisma.tournament.findUnique({
    where: { id: params.id },
    include: {
      teams: {
        include: {
          _count: { select: { members: true } },
        },
      },
      _count: { select: { teams: true } },
    },
  });

  if (!tournament || tournament.organizerId !== dbUser.id) notFound();

  // Matchs du tournoi
  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { teamA: { tournamentId: tournament.id } },
        { teamB: { tournamentId: tournament.id } },
      ],
    },
    include: {
      teamA: { select: { name: true } },
      teamB: { select: { name: true } },
    },
    orderBy: { date: "asc" },
  });

  return (
    <div className="space-y-8">

      {/* Header tournoi */}
      <div>
        <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          {tournament.sport}
        </span>
        <h2 className="mt-3 text-3xl font-bold text-slate-900">{tournament.name}</h2>
        <p className="text-slate-500 mt-1">📍 {tournament.city}</p>
        <p className="text-sm text-slate-400 mt-0.5">
          Début : {new Date(tournament.startDate).toLocaleDateString("fr-CA", {
            day: "numeric", month: "long", year: "numeric"
          })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase">Équipes</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{tournament._count.teams}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase">Frais</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">
            {tournament.entryFee === 0 ? "Gratuit" : `${(tournament.entryFee / 100).toFixed(2)} CAD`}
          </p>
        </div>
      </div>

      {/* Équipes */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Équipes</h3>
        {tournament.teams.length === 0 ? (
          <p className="text-sm text-slate-400">Aucune équipe pour l&apos;instant.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {tournament.teams.map((team) => (
              <div key={team.id} className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between">
                <p className="font-medium text-slate-900">{team.name}</p>
                <span className="text-xs text-slate-500">
                  {team._count.members} / {team.maxCapacity}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Matchs */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Matchs</h3>

        {matches.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <p className="text-sm text-slate-500">Aucun match planifié.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => (
              <div key={match.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-center gap-4">
                  <p className="flex-1 font-bold text-slate-900 text-center">{match.teamA.name}</p>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-500">VS</span>
                  <p className="flex-1 font-bold text-slate-900 text-center">{match.teamB.name}</p>
                </div>
                <div className="mt-2 flex justify-between text-xs text-slate-400">
                  <span>📍 {match.location}</span>
                  <span>🗓 {new Date(match.date).toLocaleDateString("fr-CA")}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Formulaire créer un match */}
        <div className="mt-6">
          <CreateMatchForm
            tournamentId={tournament.id}
            teams={tournament.teams.map((t) => ({ id: t.id, name: t.name }))}
          />
        </div>
      </div>

    </div>
  );
}