// src/app/(player)/layout.tsx
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

const playerLinks = [
  { href: "/profile", label: "Mon profil" },
  { href: "/tournaments", label: "Tournois" },
  { href: "/teams", label: "Équipes" },
  { href: "/my-requests", label: "Mes demandes" },
  { href: "/matches", label: "Matchs" },
];

export default function PlayerLayout({
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
              Espace Joueur
            </p>
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            {playerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <UserButton />
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          {children}
        </div>
      </section>
    </div>
  );
}