// src/app/(player)/teams/[id]/page.tsx
// src/app/(player)/teams/[id]/page.tsx
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import JoinButton from "@/components/JoinButton";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();

  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      tournament: true,
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
      _count: { select: { members: true } },
    },
  });

  if (!team) notFound();

  const spotsLeft = team.maxCapacity - team._count.members;
  const isFull = spotsLeft <= 0;

  let alreadyRequested = false;
  if (userId) {
    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (dbUser) {
      const existing = await prisma.joinRequest.findUnique({
        where: { playerId_teamId: { playerId: dbUser.id, teamId: team.id } },
      });
      alreadyRequested = !!existing;
    }
  }

  const levelLabels: Record<string, string> = {
    BEGINNER: "🌱 Débutant",
    INTERMEDIATE: "⚡ Intermédiaire",
    ADVANCED: "🔥 Avancé",
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 shadow-lg">
        <div className="absolute top-0 right-0 h-40 w-40 translate-x-8 -translate-y-8 rounded-full bg-white/10 blur-2xl" />
        <div className="relative z-10">
          <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white mb-3">
            {team.tournament.sport}
          </span>
          <h2 className="text-3xl font-black text-white">{team.name}</h2>
          <p className="mt-1 text-emerald-100">{team.tournament.name}</p>
          <p className="text-sm text-emerald-200">📍 {team.tournament.city}</p>
        </div>
      </div>

      {/* Infos */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Places</p>
          <p className={`mt-1 text-2xl font-bold ${isFull ? "text-red-500" : "text-emerald-600"}`}>
            {team._count.members} / {team.maxCapacity}
          </p>
          <p className="text-sm text-slate-500">
            {isFull ? "Équipe complète" : `${spotsLeft} place${spotsLeft > 1 ? "s" : ""} restante${spotsLeft > 1 ? "s" : ""}`}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Frais</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {team.tournament.entryFee === 0
              ? "Gratuit"
              : `${(team.tournament.entryFee / 100).toFixed(2)} CAD`}
          </p>
        </div>
      </div>

      {/* Membres */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="font-bold text-slate-900 text-lg mb-4">
          Membres ({team._count.members})
        </h3>
        {team.members.length === 0 ? (
          <p className="text-sm text-slate-400">Aucun membre pour l&apos;instant.</p>
        ) : (
          <div className="space-y-3">
            {team.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                {/* Avatar */}
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-sm font-black text-white shrink-0">
                  {member.fullName.charAt(0).toUpperCase()}
                </div>

                {/* Infos */}
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{member.fullName}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {member.playerProfile?.city && (
                      <span className="text-xs text-slate-500">
                        📍 {member.playerProfile.city}
                      </span>
                    )}
                    {member.playerProfile?.favoriteSport && (
                      <span className="text-xs text-slate-500">
                        🏅 {member.playerProfile.favoriteSport}
                      </span>
                    )}
                    {member.playerProfile?.position && (
                      <span className="text-xs text-slate-500">
                        👤 {member.playerProfile.position}
                      </span>
                    )}
                  </div>
                </div>

                {/* Niveau */}
                {member.playerProfile?.level && (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 shrink-0">
                    {levelLabels[member.playerProfile.level]}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bouton rejoindre */}
      {!isFull && !alreadyRequested && (
        <JoinButton teamId={team.id} entryFee={team.tournament.entryFee} />
      )}

      {alreadyRequested && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm font-medium text-amber-700">
          ✅ Vous avez déjà envoyé une demande pour cette équipe.
        </div>
      )}

      {isFull && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-medium text-red-700">
          ❌ Cette équipe est complète.
        </div>
      )}

    </div>
  );
}