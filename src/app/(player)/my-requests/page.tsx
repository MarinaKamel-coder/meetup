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
    PENDING: { label: "En attente", classes: "bg-amber-100 text-amber-700" },
    ACCEPTED: { label: "Acceptée", classes: "bg-emerald-100 text-emerald-700" },
    REJECTED: { label: "Refusée", classes: "bg-red-100 text-red-700" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Mes demandes</h2>
        <p className="text-sm text-slate-500 mt-1">
          Suivez l'état de vos demandes d'adhésion.
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-base font-medium text-slate-700">
            Vous n'avez encore envoyé aucune demande.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Parcourez les équipes disponibles pour en rejoindre une !
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            const status = statusConfig[request.status];
            return (
              <div
                key={request.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    {/* Équipe + tournoi */}
                    <p className="font-semibold text-slate-900">
                      {request.team.name}
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {request.team.tournament.name} •{" "}
                      {request.team.tournament.sport}
                    </p>

                    {/* Message */}
                    {request.message && (
                      <p className="mt-2 text-sm text-slate-600 italic border-l-2 border-slate-200 pl-3">
                        "{request.message}"
                      </p>
                    )}

                    {/* Date */}
                    <p className="mt-2 text-xs text-slate-400">
                      Envoyée le{" "}
                      {new Date(request.createdAt).toLocaleDateString("fr-CA", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Badge statut */}
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${status.classes}`}>
                    {status.label}
                  </span>
                </div>

                {/* Bouton annuler si en attente */}
                {request.status === "PENDING" && (
                  <div className="mt-4">
                    <CancelButton requestId={request.id} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}