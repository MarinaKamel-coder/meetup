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
      members: { select: { id: true, fullName: true } },
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          {team.tournament.sport}
        </span>
        <h2 className="mt-3 text-3xl font-bold text-slate-900">{team.name}</h2>
        <p className="mt-1 text-slate-500">{team.tournament.name}</p>
        <p className="text-sm text-slate-400">📍 {team.tournament.city}</p>
      </div>

      {/* Infos */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Places
          </p>
          <p className={`mt-1 text-2xl font-bold ${isFull ? "text-red-500" : "text-emerald-600"}`}>
            {team._count.members} / {team.maxCapacity}
          </p>
          <p className="text-sm text-slate-500">
            {isFull
              ? "Équipe complète"
              : `${spotsLeft} place${spotsLeft > 1 ? "s" : ""} restante${spotsLeft > 1 ? "s" : ""}`}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Frais d&apos;inscription
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {team.tournament.entryFee === 0
              ? "Gratuit"
              : `${(team.tournament.entryFee / 100).toFixed(2)} CAD`}
          </p>
        </div>
      </div>

      {/* Membres */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="font-semibold text-slate-900 mb-3">
          Membres ({team._count.members})
        </h3>
        {team.members.length === 0 ? (
          <p className="text-sm text-slate-400">Aucun membre pour l&apos;instant.</p>
        ) : (
          <ul className="space-y-2">
            {team.members.map((member) => (
              <li key={member.id} className="flex items-center gap-2 text-sm text-slate-700">
                <span className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                  {member.fullName.charAt(0).toUpperCase()}
                </span>
                {member.fullName}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Bouton rejoindre */}
      {!isFull && !alreadyRequested && (
        <JoinButton
          teamId={team.id}
          entryFee={team.tournament.entryFee}
        />
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