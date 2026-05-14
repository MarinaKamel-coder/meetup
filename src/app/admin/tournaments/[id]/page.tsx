import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import Link from "next/link";
import DeleteButton from "@/components/admin/DeleteButton";

// Importation des actions (Vérifie bien tes chemins d'import)
import { deleteTeam } from "@/server/actions/teams";
import { deleteTournament } from "@/server/actions/tournaments";

import { 
  Trophy, Users2, Calendar, MapPin, 
  ArrowLeft, Activity, UserPlus, ShieldCheck 
} from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminTournamentDetailsPage({ params }: Props) {
  const { id } = await params;

  // 1. Protection Admin
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ 
    where: { clerkId: userId },
    select: { id: true, role: true }
  });
  
  if (!dbUser || dbUser.role !== "ADMIN") redirect("/");

  // 2. Récupération des données du tournoi
  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      organizer: true,
      teams: {
        include: {
          _count: { select: { members: true } }
        },
        orderBy: { createdAt: "asc" }
      },
      _count: { select: { teams: true } }
    }
  });

  if (!tournament) notFound();

  // Calcul du nombre total de joueurs inscrits au tournoi
  const totalPlayers = tournament.teams.reduce((acc, team) => acc + team._count.members, 0);

  return (
    <div className="space-y-8">
      {/* --- NAVIGATION --- */}
      <Link 
        href="/admin/tournaments" 
        className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-600 font-bold text-sm transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Retour à la liste des tournois
      </Link>

      {/* --- HEADER DU TOURNOI --- */}
      <header className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-emerald-500 text-white p-2 rounded-xl shadow-lg shadow-emerald-200">
                  <Trophy className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  {tournament.sport}
                </span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight italic mb-2">
                {tournament.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm font-bold">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-500" /> {tournament.city}
                </span>
                <span className="text-slate-200">•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-500" /> Créé le {tournament.createdAt.toLocaleDateString('fr-CA')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-[1.5rem]">
               <p className="text-[10px] font-black uppercase px-3 text-slate-400">Zone de danger</p>
               <DeleteButton 
                action={deleteTournament} 
                id={tournament.id} 
                name="tournamentId" 
                label={`le tournoi "${tournament.name}"`} 
              />
            </div>
          </div>
        </div>
        {/* Décoration subtile en arrière-plan */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 opacity-[0.03] pointer-events-none">
          <Trophy className="w-64 h-64 text-slate-900" />
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* --- COLONNE INFOS & STATS --- */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" /> Stats Rapides
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl text-center">
                <p className="text-2xl font-black text-slate-900">{tournament._count.teams}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Équipes</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl text-center">
                <p className="text-2xl font-black text-slate-900">{totalPlayers}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Joueurs</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Organisateur</h3>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-white">
                {tournament.organizer.fullName.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-sm">{tournament.organizer.fullName}</p>
                <p className="text-[10px] text-slate-400 font-medium">{tournament.organizer.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- COLONNE GESTION DES ÉQUIPES --- */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black italic flex items-center gap-2 text-slate-900">
              <Users2 className="w-5 h-5 text-emerald-500" />
              Équipes Inscrites
            </h2>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-50">
              {tournament.teams.length > 0 ? (
                tournament.teams.map((team) => (
                  <div key={team.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                    <div>
                      <p className="font-black text-slate-900 group-hover:text-emerald-600 transition-colors uppercase italic tracking-tight">
                        {team.name}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                          <UserPlus className="w-3 h-3 text-emerald-500" />
                          {team._count.members} / {team.maxCapacity} joueurs
                        </span>
                      </div>
                    </div>
                    
                    <DeleteButton 
                      action={deleteTeam} 
                      id={team.id} 
                      name="teamId" 
                      label={`l'équipe "${team.name}"`} 
                    />
                  </div>
                ))
              ) : (
                <div className="py-20 text-center">
                  <Users2 className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold italic">Aucune équipe n'est inscrite pour le moment.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}