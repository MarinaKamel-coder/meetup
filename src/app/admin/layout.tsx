import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { 
  LayoutDashboard, 
  Trophy, 
  Home, 
  ChevronRight,
  ShieldCheck
} from "lucide-react";

const adminLinks = [
  { 
    href: "/admin", 
    label: "Vue globale", 
    icon: LayoutDashboard,
    description: "Statistiques et rapports"
  },
  { 
    href: "/admin/tournaments", 
    label: "Tournois", 
    icon: Trophy,
    description: "Équipes et matchs"
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* --- SIDEBAR / HEADER --- */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          
          <div className="flex items-center gap-12">
            {/* Logo & Branding */}
            <Link href="/" className="group flex items-center gap-3">
              <div className="bg-slate-900 p-2.5 rounded-2xl group-hover:bg-emerald-500 transition-all shadow-lg shadow-slate-200">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1">
                  <h1 className="text-xl font-black italic leading-none text-slate-900">
                    Meetup<span className="text-emerald-500">.</span>
                  </h1>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-0.5">
                  Console d'administration
                </p>
              </div>
            </Link>

            {/* Navigation principale */}
            <nav className="hidden items-center gap-1 lg:flex">
              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-center gap-3 px-5 py-2.5 rounded-2xl text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all"
                >
                  <div className="p-1.5 rounded-lg bg-slate-50 group-hover:bg-white shadow-sm group-hover:shadow transition-all">
                    <link.icon className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Actions utilisateur */}
          <div className="flex items-center gap-6">
            <div className="h-8 w-[1px] bg-slate-100 hidden md:block" />
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Connecté en tant que</p>
                <p className="text-xs font-bold text-slate-900">Administrateur</p>
              </div>
              <UserButton 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-10 h-10 rounded-2xl border-2 border-white shadow-md hover:scale-105 transition-transform"
                  }
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* --- ZONE DE CONTENU --- */}
      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Container de contenu avec animation fluide */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
          {children}
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="mx-auto max-w-7xl px-6 py-12 border-t border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
              Système de gestion Meetup Sportif © 2026
            </p>
          </div>
          
          <div className="flex gap-8">
             <Link href="/admin" className="text-[10px] font-black uppercase text-slate-400 hover:text-emerald-500 transition-colors">Support</Link>
             <Link href="/admin" className="text-[10px] font-black uppercase text-slate-400 hover:text-emerald-500 transition-colors">Documentation</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}