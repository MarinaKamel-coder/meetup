// src/app/(player)/my-requests/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import CancelButton from "@/components/CancelButton";

export default async function MyRequestsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) redirect("/sign-in");

  const requests = await prisma.joinRequest.findMany({
    where: { playerId: dbUser.id },
    include: {
      team: {
        include: {
          tournament: { select: { name: true, sport: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const statusConfig = {
    PENDING: {
      label: "En attente",
      classes: "bg-amber-100 text-amber-700 border border-amber-200",
      dot: "bg-amber-400",
      emoji: "⏳",
    },
    ACCEPTED: {
      label: "Acceptée",
      classes: "bg-emerald-100 text-emerald-700 border border-emerald-200",
      dot: "bg-emerald-400",
      emoji: "✅",
    },
    REJECTED: {
      label: "Refusée",
      classes: "bg-red-100 text-red-700 border border-red-200",
      dot: "bg-red-400",
      emoji: "❌",
    },
  };

  const pending = requests.filter((r) => r.status === "PENDING");
  const others = requests.filter((r) => r.status !== "PENDING");

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 shadow-lg">
        <div className="absolute top-0 right-0 h-40 w-40 translate-x-8 -translate-y-8 rounded-full bg-amber-500/20 blur-2xl" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">
              Espace Joueur
            </p>
            <h2 className="mt-2 text-3xl font-black text-white">Mes demandes</h2>
            <p className="mt-2 text-slate-400">
              Suivez l&apos;état de vos candidatures.
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

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <p className="text-4xl mb-4">📭</p>
          <p className="text-base font-semibold text-slate-700">
            Aucune demande envoyée pour le moment.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Parcourez les équipes disponibles pour en rejoindre une !
          </p>
        </div>
      ) : (
        <div className="space-y-8">

          {/* En attente */}
          {pending.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-4">
                En attente
              </h3>
              <div className="space-y-4">
                {pending.map((request) => {
                  const status = statusConfig[request.status];
                  return (
                    <div
                      key={request.id}
                      className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status.classes}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${status.dot} animate-pulse`} />
                              {status.label}
                            </span>
                          </div>
                          <p className="mt-2 font-bold text-slate-900 text-lg">
                            {request.team.name}
                          </p>
                          <p className="text-sm text-slate-500 mt-0.5">
                            🏆 {request.team.tournament.name} • {request.team.tournament.sport}
                          </p>
                          {request.message && (
                            <p className="mt-3 text-sm text-slate-600 italic border-l-2 border-amber-300 pl-3">
                              &quot;{request.message}&quot;
                            </p>
                          )}
                          <p className="mt-3 text-xs text-slate-400">
                            Envoyée le{" "}
                            {new Date(request.createdAt).toLocaleDateString("fr-CA", {
                              day: "numeric", month: "long", year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-amber-200">
                        <CancelButton requestId={request.id} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Traitées */}
          {others.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-4">
                Traitées
              </h3>
              <div className="space-y-3">
                {others.map((request) => {
                  const status = statusConfig[request.status];
                  return (
                    <div
                      key={request.id}
                      className={`rounded-2xl border p-5 flex items-center justify-between ${
                        request.status === "ACCEPTED"
                          ? "border-emerald-200 bg-emerald-50/50"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div>
                        <p className="font-bold text-slate-900">{request.team.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {request.team.tournament.name}
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.classes}`}>
                        {status.emoji} {status.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}