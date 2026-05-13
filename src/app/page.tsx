// src/app/page.tsx
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function HomePage() {
  const { userId } = await auth();

  // Si connecté, rediriger vers le bon dashboard
  if (userId) {
    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (dbUser?.role === "ORGANIZER") redirect("/dashboard");
    if (dbUser?.role === "ADMIN") redirect("/admin");
    if (dbUser?.role === "PLAYER") redirect("/profile");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight">
        Plateforme de Gestion de Ligues Sportives
      </h1>

      <p className="mt-4 max-w-2xl text-lg text-slate-600">
        Connecter organisateurs et joueurs passionnés autour de tournois et d&apos;équipes sportives communautaires.
      </p>

      <div className="mt-8 flex gap-4">
        <Link
          href="/sign-in"
          className="rounded-md bg-slate-900 px-5 py-3 text-white transition hover:bg-slate-700"
        >
          Se connecter
        </Link>
        <Link
          href="/sign-up"
          className="rounded-md border border-slate-900 px-5 py-3 text-slate-900 transition hover:bg-slate-100"
        >
          S&apos;inscrire
        </Link>
      </div>
    </main>
  );
}