"use server"

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const matchSchema = z.object({
  teamAId: z.string().cuid(),
  teamBId: z.string().cuid(),
  date: z.coerce.date(),
  location: z.string().min(3, "Le lieu est requis"),
});

// --- CRÉATION ---
export async function createMatch(data: unknown) {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Non connecté" };

    const validatedFields = matchSchema.safeParse(data);
    if (!validatedFields.success) return { error: "Données invalides" };

    const { teamAId, teamBId, date, location } = validatedFields.data;

    if (teamAId === teamBId) {
      return { error: "Une équipe ne peut pas jouer contre elle-même." };
    }

    const [teamA, teamB] = await Promise.all([
      prisma.team.findUnique({ where: { id: teamAId }, select: { tournamentId: true } }),
      prisma.team.findUnique({ where: { id: teamBId }, select: { tournamentId: true } }),
    ]);

    if (!teamA || !teamB || teamA.tournamentId !== teamB.tournamentId) {
      return { error: "Les équipes doivent appartenir au même tournoi." };
    }

    const match = await prisma.match.create({
      data: {
        teamAId,
        teamBId,
        date,
        location,
        tournamentId: teamA.tournamentId,
      },
    });

    revalidatePath(`/tournaments/${teamA.tournamentId}`);
    revalidatePath("/admin"); // Mise à jour du panneau admin
    return { success: true, matchId: match.id };
  } catch (error) {
    return { error: "Erreur lors de la création du match." };
  }
}

// --- MISE À JOUR DU SCORE ---
export async function updateMatchScore(matchId: string, scoreA: number, scoreB: number) {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Non authentifié" };

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    
    // Vérifier si l'utilisateur est Admin ou l'organisateur du tournoi
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { tournament: { select: { organizerId: true } } }
    });

    if (!match || (match.tournament.organizerId !== dbUser?.id && dbUser?.role !== "ADMIN")) {
      return { error: "Action non autorisée" };
    }

    await prisma.match.update({
      where: { id: matchId },
      data: { scoreA, scoreB },
    });

    revalidatePath("/admin");
    revalidatePath(`/tournaments/${match.tournamentId}`);
    return { success: true };
  } catch (error) {
    return { error: "Erreur lors de la mise à jour du score." };
  }
}

// --- SUPPRESSION (Pour le panneau Admin) ---
export async function deleteMatch(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return { error: "Non connecté" };

  const id = formData.get("matchId") as string;
  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });

  const match = await prisma.match.findUnique({
    where: { id },
    include: { tournament: { select: { organizerId: true } } }
  });

  if (!match || (match.tournament.organizerId !== dbUser?.id && dbUser?.role !== "ADMIN")) {
    return { error: "Action non autorisée" };
  }

  try {
    await prisma.match.delete({ where: { id } });
    revalidatePath("/admin");
    revalidatePath(`/tournaments/${match.tournamentId}`);
    return { success: true };
  } catch (error) {
    return { error: "Erreur lors de la suppression du match." };
  }
}