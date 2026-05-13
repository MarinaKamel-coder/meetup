// src/app/(organizer)/requests/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import RequestActions from "@/components/RequestActions";

export default async function RequestsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser || dbUser.role !== "ORGANIZER") redirect("/dashboard");

  const requests = await prisma.joinRequest.findMany({
    where: {
      team: {
        tournament: { organizerId: dbUser.id },
      },
    },
    include: {
      player: {
        include: { playerProfile: true },
      },
      team: {
        include: { tournament: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const pending = requests.filter((r) => r.status === "PENDING");
  const treated = requests.filter((r) => r.status !== "PENDING");

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 shadow-lg">
        <div className="absolute top-0 right-0 h-40 w-40 translate-x-8 -translate-y-8 rounded-full bg-emerald-500/20 blur-2xl" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
              Gestion Organisateur
            </p>
            <h2 className="mt-2 text-3xl font-black text-white">
              Demandes d&apos;adhésion
            </h2>
            <p className="mt-2 text-slate-400">
              Acceptez ou refusez les candidatures des joueurs.
            </p>
          </div>
          {pending.length > 0 && (
            <div className="rounded-2xl bg-amber-500/20 border border-amber-500/30 px-5 py-3 text-center">
              <p className="text-3xl font-black text-amber-400">{pending.length}</p>
              <p className="text-xs font-medium text-amber-300">en attente</p>
            </div>
          )}
        </div>
      </div>

      {/* En attente */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-4">
          En attente{" "}
          <span className="ml-2 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
            {pending.length}
          </span>
        </h3>

        {pending.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <p className="text-4xl mb-3">🎉</p>
            <p className="text-sm font-semibold text-slate-700">
              Toutes les demandes ont été traitées !
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((request) => (
              <div
                key={request.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Joueur */}
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-lg font-black text-white shadow-lg shadow-emerald-500/20">
                      {request.player.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-lg">
                        {request.player.fullName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {request.player.playerProfile?.city && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                            📍 {request.player.playerProfile.city}
                          </span>
                        )}
                        {request.player.playerProfile?.favoriteSport && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                            🏅 {request.player.playerProfile.favoriteSport}
                          </span>
                        )}
                        {request.player.playerProfile?.level && (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            {request.player.playerProfile.level === "BEGINNER" ? "🌱 Débutant" :
                             request.player.playerProfile.level === "INTERMEDIATE" ? "⚡ Intermédiaire" :
                             "🔥 Avancé"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <RequestActions requestId={request.id} />
                </div>

                {/* Équipe + message */}
                <div className="mt-4 pl-16">
                  <div className="flex gap-2 flex-wrap">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      🏅 {request.team.name}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      🏆 {request.team.tournament.name}
                    </span>
                  </div>

                  {request.message && (
                    <p className="mt-3 text-sm text-slate-600 italic border-l-2 border-emerald-300 pl-3">
                      &quot;{request.message}&quot;
                    </p>
                  )}

                  <p className="mt-2 text-xs text-slate-400">
                    Reçue le{" "}
                    {new Date(request.createdAt).toLocaleDateString("fr-CA", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Traitées */}
      {treated.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-4">
            Traitées{" "}
            <span className="ml-2 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
              {treated.length}
            </span>
          </h3>
          <div className="space-y-3">
            {treated.map((request) => (
              <div
                key={request.id}
                className={`rounded-2xl border p-4 flex items-center justify-between ${
                  request.status === "ACCEPTED"
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-sm font-black text-white ${
                    request.status === "ACCEPTED"
                      ? "bg-emerald-500"
                      : "bg-slate-400"
                  }`}>
                    {request.player.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {request.player.fullName}
                    </p>
                    <p className="text-xs text-slate-400">{request.team.name}</p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  request.status === "ACCEPTED"
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : "bg-red-100 text-red-700 border border-red-200"
                }`}>
                  {request.status === "ACCEPTED" ? "✅ Acceptée" : "❌ Refusée"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}