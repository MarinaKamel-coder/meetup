import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

const adminLinks = [
  { href: "/admin", label: "Vue globale" },
  { href: "/admin/tournaments", label: "Tournois" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <Link href="/" className="text-xl font-bold tracking-tight text-white">
              Meetup Sportif
            </Link>
            <p className="text-xs uppercase tracking-[0.25em] text-amber-400">
              Admin Console
            </p>
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-300 transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}