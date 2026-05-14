import prisma from "@/lib/prisma";
import Link from "next/link";
import { Trophy, Calendar, MapPin, ChevronRight, Plus } from "lucide-react";

export default async function AdminTournamentsListPage() {
  const tournaments = await prisma.tournament.findMany({
    include: {
      _count: { select: { teams: true } },
      organizer: { select: { fullName: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black italic text-slate-900">Gestion des Tournois</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Contrôle et modération</p>
        </div>
      </div>

      <div className="grid gap-4">
        {tournaments.map((t) => (
          <Link 
            key={t.id} 
            href={`/admin/tournaments/${t.id}`}
            className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="flex items-center gap-5">
              <div className="bg-slate-50 p-4 rounded-2xl group-hover:bg-emerald-50 transition-colors">
                <Trophy className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors lowercase first-letter:uppercase">
                  {t.name}
                </h2>
                <div className="flex flex-wrap gap-4 mt-1 text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-500" /> {t.city}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-emerald-500" /> {t.sport}</span>
                  <span className="text-slate-900">Par {t.organizer.fullName}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-right hidden sm:block">
                <p className="text-xl font-black text-slate-900">{t._count.teams}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-nowrap">Équipes inscrites</p>
              </div>
              <div className="bg-slate-900 p-2 rounded-xl text-white group-hover:bg-emerald-500 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </Link>
        ))}

        {tournaments.length === 0 && (
          <div className="bg-white rounded-[2.5rem] border border-dashed border-slate-200 py-20 text-center">
            <Trophy className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold italic">Aucun tournoi trouvé dans la base de données.</p>
          </div>
        )}
      </div>
    </div>
  );
}