import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";

// Importation de tes actions centralisées
import { updateRole } from "@/server/actions/admin";
import { deleteTournament } from "@/server/actions/tournaments";
import { deleteTeam } from "@/server/actions/teams";

import { 
  Users, Trophy, Users2, Download, ShieldCheck, 
  Activity, MapPin
} from "lucide-react";

export default async function AdminPage() {
  // 1. Protection de la route
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser || dbUser.role !== "ADMIN") redirect("/");

  // 2. Récupération des données en parallèle
  const [users, tournaments] = await Promise.all([
    prisma.user.findMany({ orderBy: { fullName: "asc" } }),
    prisma.tournament.findMany({
      include: {
        teams: {
          include: {
            _count: { select: { members: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // 3. Calcul des statistiques
  const totalTeams = tournaments.reduce((acc, t) => acc + t.teams.length, 0);
  const totalPlayers = users.filter(u => u.role === "PLAYER").length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        
        {/* --- HEADER --- */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Live System Control</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 italic">
              Admin<span className="text-emerald-500 text-5xl">.</span>Console
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <a 
              href="/admin/export" 
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-2xl text-sm font-bold transition-all shadow-lg active:scale-95"
            >
              <Download className="w-4 h-4" />
              Exporter les données (CSV)
            </a>
          </div>
        </header>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: "Tournois", value: tournaments.length, icon: Trophy, color: "bg-indigo-600" },
            { label: "Équipes", value: totalTeams, icon: Users2, color: "bg-violet-600" },
            { label: "Joueurs", value: totalPlayers, icon: Users, color: "bg-emerald-500" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:border-emerald-100 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                  <p className="text-5xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-2xl ${stat.color} text-white shadow-xl shadow-${stat.color.split('-')[1]}-200`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* --- MAIN: USER MANAGEMENT --- */}
          <section className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-black flex items-center gap-3 italic px-2">
              <Users className="w-6 h-6 text-emerald-500" />
              Utilisateurs
            </h2>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/50 text-[10px] uppercase font-black tracking-widest text-slate-400">
                    <tr>
                      <th className="px-8 py-6">Profil</th>
                      <th className="px-8 py-6">Rôle Actuel</th>
                      <th className="px-8 py-6 text-right">Mise à jour</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {users.map((user) => (
                      <tr key={user.id} className="group hover:bg-slate-50/30 transition-all">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="h-11 w-11 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 border border-slate-200 uppercase">
                              {user.fullName ? user.fullName.charAt(0) : '?'}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{user.fullName}</p>
                              <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                            user.role === 'ADMIN' ? 'bg-rose-50 text-rose-600' : 
                            user.role === 'ORGANIZER' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              user.role === 'ADMIN' ? 'bg-rose-500' : 
                              user.role === 'ORGANIZER' ? 'bg-amber-500' : 'bg-emerald-500'
                            }`} />
                            {user.role}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          {/* SOLUTION : On utilise une fonction async anonyme avec "use server" */}
                          <form 
                            action={async (formData: FormData) => {
                              "use server";
                              await updateRole(formData);
                            }} 
                            className="flex items-center justify-end gap-3"
                          >
                            <input type="hidden" name="userId" value={user.id} />
                            <select 
                              name="role" 
                              aria-label="role"
                              defaultValue={user.role}
                              className="bg-slate-100 border-none rounded-xl text-[11px] px-3 py-2 font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                            >
                              <option value="PLAYER">PLAYER</option>
                              <option value="ORGANIZER">ORGANIZER</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                            <button 
                              type="submit" 
                              title="submitButton"
                              className="bg-slate-900 text-white p-2.5 rounded-xl hover:bg-emerald-600 transition-all active:scale-90 shadow-md"
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* --- SIDEBAR: TOURNAMENTS --- */}
          <aside className="space-y-6">
            <h2 className="text-2xl font-black flex items-center gap-3 italic px-2">
              <Activity className="w-6 h-6 text-emerald-500" />
              Tournois
            </h2>
            <div className="space-y-6">
              {tournaments.map((tournament) => (
                <div key={tournament.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start mb-5">
                    <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-lg shadow-slate-200">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <DeleteButton 
                      action={deleteTournament} 
                      id={tournament.id} 
                      label={tournament.name} 
                    />
                  </div>
                  
                  <h3 className="font-black text-lg text-slate-900 mb-1 leading-tight">{tournament.name}</h3>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                    <MapPin className="w-3 h-3 text-emerald-500" />
                    <span>{tournament.city}</span>
                    <span className="text-slate-200">•</span>
                    <span>{tournament.sport}</span>
                  </div>
                  
                  <div className="space-y-3 border-t border-slate-50 pt-5">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex justify-between items-center">
                      Équipes 
                      <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">{tournament.teams.length}</span>
                    </p>
                    
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {tournament.teams.map(team => (
                        <div key={team.id} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl hover:bg-emerald-50 transition-colors group/team">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700 group-hover/team:text-emerald-700 transition-colors">{team.name}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase">{team._count.members} inscrits</span>
                          </div>
                          <DeleteButton 
                            action={deleteTeam} 
                            id={team.id} 
                            label={team.name} 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}