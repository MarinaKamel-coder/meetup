import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import RequestActions from "@/components/RequestActions";
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Trophy, 
  User, 
  ShieldCheck, 
  AlertCircle 
} from "lucide-react";

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
      // --- FILTRE DE SÉCURITÉ ---
      // On masque les "PENDING" de Stripe pour éviter que l'organisateur accepte un impayé.
      OR: [
        { paymentStatus: "PAID" },
        { paymentStatus: "NOT_REQUIRED" }
      ]
    },3h30
    include: {
      player: {
        include: { playerProfile: true },
      },
      team: {
        include: { 
          tournament: { 
            select: { name: true, entryFee: true } 
          } 
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const pending = requests.filter((r) => r.status === "PENDING");
  const treated = requests.filter((r) => r.status !== "PENDING");

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* --- HEADER --- */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-10 shadow-2xl">
        <div className="absolute top-0 right-0 h-64 w-64 translate-x-16 -translate-y-16 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">Console Organisateur</span>
            </div>
            <h2 className="text-4xl font-black text-white italic tracking-tight">
              Demandes d&apos;adhésion
            </h2>
            <p className="mt-2 text-slate-400 font-medium max-w-md">
              Gérez les candidatures entrantes. Seules les demandes avec paiement confirmé sont affichées.
            </p>
          </div>
          
          {pending.length > 0 && (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 text-center min-w-[140px]">
              <p className="text-4xl font-black text-emerald-400">{pending.length}</p>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">À traiter</p>
            </div>
          )}
        </div>
      </div>

      {/* --- SECTION : EN ATTENTE --- */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <Clock className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">
            Demandes prioritaires
          </h3>
        </div>

        {pending.length === 0 ? (
          <div className="rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-slate-50/50 p-20 text-center">
            <div className="bg-white w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="text-lg font-black text-slate-900 italic">Tout est à jour !</p>
            <p className="text-sm text-slate-400 font-medium">Aucune nouvelle demande à traiter pour le moment.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pending.map((request) => (
              <div
                key={request.id}
                className="group relative rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Profil Joueur */}
                  <div className="flex items-center gap-5">
                    <div className="h-16 w-16 rounded-2xl bg-slate-900 flex items-center justify-center text-xl font-black text-white shadow-lg group-hover:scale-105 transition-transform">
                      {request.player.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-black text-slate-900 text-xl italic uppercase tracking-tight">
                          {request.player.fullName}
                        </p>
                        {request.paymentStatus === "PAID" && (
                          <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded-full border border-emerald-100 uppercase">
                            Payé
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                          <MapPin className="w-3 h-3 text-emerald-500" /> 
                          {request.player.playerProfile?.city || "Non spécifié"}
                        </span>
                        <span className="text-slate-200">•</span>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                          <Trophy className="w-3 h-3 text-emerald-500" /> 
                          {request.player.playerProfile?.level || "Débutant"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions (Client Component) */}
                  <div className="flex items-center gap-3 self-end lg:self-center bg-slate-50 p-2 rounded-2xl">
                    <RequestActions requestId={request.id} />
                  </div>
                </div>

                {/* Détails de la demande */}
                <div className="mt-6 pt-6 border-t border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 rounded-full bg-slate-100 text-[10px] font-black text-slate-600 uppercase">
                      Équipe: {request.team.name}
                    </div>
                    <div className="px-3 py-1 rounded-full bg-emerald-100 text-[10px] font-black text-emerald-700 uppercase">
                      Tournoi: {request.team.tournament.name}
                    </div>
                  </div>

                  {request.message && (
                    <div className="flex-1 max-w-md bg-emerald-50/50 px-4 py-2 rounded-xl border-l-4 border-emerald-400">
                      <p className="text-xs text-emerald-800 italic font-medium">
                        &quot;{request.message}&quot;
                      </p>
                    </div>
                  )}

                  <p className="text-[10px] font-bold text-slate-300 uppercase">
                    Reçue le {new Date(request.createdAt).toLocaleDateString("fr-CA")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- SECTION : TRAITÉES --- */}
      {treated.length > 0 && (
        <div className="pt-8 border-t border-slate-100">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 px-2">
            Historique récent
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {treated.map((request) => (
              <div
                key={request.id}
                className={`rounded-3xl border p-5 flex items-center justify-between transition-all ${
                  request.status === "ACCEPTED"
                    ? "border-emerald-100 bg-white"
                    : "border-slate-100 bg-slate-50 opacity-75"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-black text-white ${
                    request.status === "ACCEPTED" ? "bg-emerald-500 shadow-lg shadow-emerald-100" : "bg-slate-400"
                  }`}>
                    {request.player.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 uppercase italic">
                      {request.player.fullName}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      {request.team.name}
                    </p>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  request.status === "ACCEPTED" 
                    ? "bg-emerald-50 text-emerald-600" 
                    : "bg-slate-200 text-slate-500"
                }`}>
                  {request.status === "ACCEPTED" ? "Acceptée" : "Refusée"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}