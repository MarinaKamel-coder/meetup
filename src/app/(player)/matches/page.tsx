// src/app/(player)/matches/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function MatchesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) redirect("/sign-in");

  // Récupérer les matchs des équipes dont le joueur est membre
  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { teamA: { members: { some: { id: dbUser.id } } } },
        { teamB: { members: { some: { id: dbUser.id } } } },
      ],
    },
    include: {
      teamA: { select: { id: true, name: true } },
      teamB: { select: { id: true, name: true } },
    },
    orderBy: { date: "asc" },
  });

  const now = new Date();
  const upcoming = matches.filter((m) => new Date(m.date) >= now);
  const past = matches.filter((m) => new Date(m.date) < now);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Mes matchs</h2>
        <p className="text-sm text-slate-500 mt-1">
          Consultez vos matchs à venir et passés.
        </p>
      </div>

      {/* À venir */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          À venir{" "}
          <span className="ml-2 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            {upcoming.length}
          </span>
        </h3>

        {upcoming.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <p className="text-sm text-slate-500">Aucun match à venir.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming.map((match) => (
              <MatchCard key={match.id} match={match} userId={dbUser.id} />
            ))}
          </div>
        )}
      </div>

      {/* Passés */}
      {past.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Passés{" "}
            <span className="ml-2 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
              {past.length}
            </span>
          </h3>
          <div className="space-y-4">
            {past.map((match) => (
              <MatchCard key={match.id} match={match} userId={dbUser.id} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MatchCard({
  match,
  userId,
}: {
  match: {
    id: string;
    date: Date;
    location: string;
    scoreA: number | null;
    scoreB: number | null;
    teamA: { id: string; name: string };
    teamB: { id: string; name: string };
  };
  userId: string;
}) {
  const isPast = new Date(match.date) < new Date();
  const hasScore = match.scoreA !== null && match.scoreB !== null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Équipes */}
      <div className="flex items-center justify-center gap-4 text-center">
        <p className="flex-1 font-bold text-slate-900 text-lg">{match.teamA.name}</p>

        {hasScore ? (
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-slate-900">{match.scoreA}</span>
            <span className="text-slate-400 font-bold">—</span>
            <span className="text-3xl font-black text-slate-900">{match.scoreB}</span>
          </div>
        ) : (
          <span className="rounded-full bg-slate-100 px-4 py-1 text-sm font-semibold text-slate-500">
            VS
          </span>
        )}

        <p className="flex-1 font-bold text-slate-900 text-lg">{match.teamB.name}</p>
      </div>

      {/* Infos */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <span>
          📍 {match.location}
        </span>
        <span>
          🗓{" "}
          {new Date(match.date).toLocaleDateString("fr-CA", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {isPast && !hasScore && (
        <p className="mt-3 text-center text-xs text-slate-400 italic">
          Score non encore saisi
        </p>
      )}
    </div>
  );
}