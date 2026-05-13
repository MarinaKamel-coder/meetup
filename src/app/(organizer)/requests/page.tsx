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
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Demandes d'adhésion</h2>
        <p className="text-sm text-slate-500 mt-1">
          Gérez les demandes des joueurs pour vos équipes.
        </p>
      </div>

      {/* Demandes en attente */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          En attente{" "}
          <span className="ml-2 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
            {pending.length}
          </span>
        </h3>

        {pending.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <p className="text-sm text-slate-500">Aucune demande en attente.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((request) => (
              <div
                key={request.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Infos joueur */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                      {request.player.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {request.player.fullName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {request.player.playerProfile?.city ?? "Ville inconnue"} •{" "}
                        {request.player.playerProfile?.favoriteSport ?? "Sport inconnu"} •{" "}
                        {request.player.playerProfile?.level ?? "Niveau inconnu"}
                      </p>
                    </div>
                  </div>

                  {/* Boutons accepter / refuser */}
                  <RequestActions requestId={request.id} />
                </div>

                {/* Équipe + tournoi */}
                <div className="mt-3 flex gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {request.team.name}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {request.team.tournament.name}
                  </span>
                </div>

                {/* Message */}
                {request.message && (
                  <p className="mt-3 text-sm text-slate-600 italic border-l-2 border-slate-200 pl-3">
                    "{request.message}"
                  </p>
                )}

                {/* Date */}
                <p className="mt-2 text-xs text-slate-400">
                  Reçu le{" "}
                  {new Date(request.createdAt).toLocaleDateString("fr-CA", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Demandes traitées */}
      {treated.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Traitées{" "}
            <span className="ml-2 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
              {treated.length}
            </span>
          </h3>
          <div className="space-y-3">
            {treated.map((request) => (
              <div
                key={request.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-500">
                    {request.player.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {request.player.fullName}
                    </p>
                    <p className="text-xs text-slate-400">{request.team.name}</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    request.status === "ACCEPTED"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {request.status === "ACCEPTED" ? "Acceptée" : "Refusée"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}