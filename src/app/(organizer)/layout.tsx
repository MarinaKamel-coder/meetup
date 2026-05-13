import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

const organizerLinks = [
    { href: "/dashboard", label: "Dashboard" }, 
    { href: "/tournaments", label: "Tournois" }, 
    { href: "/requests", label: "Demandes" },    
]; 

export default function OrganizerLayout({
    children, 
}: {
    children: React.ReactNode;
}) {
    return (
         <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <Link href="/" className="text-xl font-bold tracking-tight text-slate-900">
              Meetup Sportif
            </Link>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">
              Organizer Panel
            </p>
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            {organizerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <UserButton/>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 rounded-2xl bg-slate-900 px-6 py-8 text-white shadow-lg">
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">
            Gestion organisateur
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Gérez vos tournois, équipes et demandes en un seul endroit
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
            Suivez vos compétitions, validez les inscriptions des joueurs et gardez
            une vue claire sur toute l’activité de votre ligue.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          {children}
        </div>
      </section>
    </div>
  );
}