import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import CreateMatchForm from "@/components/CreateMatchForm";
import CreateTeamForm from "@/components/CreateTeamForm";
import TournamentActions from "@/components/TournamentActions";
import TeamActions from "@/components/TeamActions";

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser || dbUser.role !== "ORGANIZER") redirect("/dashboard");

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      teams: {
        include: {
          _count: { select: { members: true } },
          members: {
            select: {
              id: true,
              fullName: true,
              playerProfile: {
                select: {
                  city: true,
                  favoriteSport: true,
                  level: true,
                  position: true,
                },
              },
            },
          },
        },
      },
      _count: { select: { teams: true } },
    },
  });

  if (!tournament || tournament.organizerId !== dbUser.id) notFound();

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

  const levelLabels: Record<string, string> = {
    BEGINNER: "🌱",
    INTERMEDIATE: "⚡",
    ADVANCED: "🔥",
  };

  return (
    <div className="space-y-8">

      {/* Header tournoi */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 shadow-lg">
        <div className="absolute top-0 right-0 h-40 w-40 translate-x-8 -translate-y-8 rounded-full bg-emerald-500/20 blur-2xl" />
        <div className="relative z-10">
          <span className="inline-block rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400 mb-3">
            {tournament.sport}
          </span>
          <h2 className="text-3xl font-black text-white">{tournament.name}</h2>
          <p className="text-slate-400 mt-1">📍 {tournament.city}</p>
          <p className="text-sm text-slate-500 mt-0.5">
            Début : {new Date(tournament.startDate).toLocaleDateString("fr-CA", {
              day: "numeric", month: "long", year: "numeric"
            })}
          </p>
        </div>
      </div>

      {/* Actions tournoi */}
      <TournamentActions tournament={{
        id: tournament.id,
        name: tournament.name,
        sport: tournament.sport,
        city: tournament.city,
        entryFee: tournament.entryFee,
      }} />

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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Équipes</h3>
        </div>
        {tournament.teams.length === 0 ? (
          <p className="text-sm text-slate-400 mb-4">Aucune équipe pour l&apos;instant.</p>
        ) : (
          <div className="space-y-4 mb-4">
            {tournament.teams.map((team) => (
              <div key={team.id} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-slate-900">{team.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {team._count.members} / {team.maxCapacity} joueurs
                    </p>
                  </div>
                </div>

                {/* Membres */}
                {team.members.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {team.members.map((member) => (
                      <div key={member.id} className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-xs font-black text-white shrink-0">
                          {member.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900">{member.fullName}</p>
                          <div className="flex flex-wrap gap-2 mt-0.5">
                            {member.playerProfile?.city && (
                              <span className="text-xs text-slate-400">📍 {member.playerProfile.city}</span>
                            )}
                            {member.playerProfile?.favoriteSport && (
                              <span className="text-xs text-slate-400">🏅 {member.playerProfile.favoriteSport}</span>
                            )}
                            {member.playerProfile?.position && (
                              <span className="text-xs text-slate-400">👤 {member.playerProfile.position}</span>
                            )}
                          </div>
                        </div>
                        {member.playerProfile?.level && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 shrink-0">
                            {levelLabels[member.playerProfile.level]}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <TeamActions team={{
                  id: team.id,
                  name: team.name,
                  maxCapacity: team.maxCapacity,
                  tournamentId: tournament.id,
                  membersCount: team._count.members,
                  members: team.members, 
                }} />
              </div>
            ))}
          </div>
        )}
        <CreateTeamForm tournamentId={tournament.id} />
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