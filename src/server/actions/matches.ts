"use server"

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Petit schéma rapide pour la validation interne
const matchSchema = z.object({
  teamAId: z.string().cuid(),
  teamBId: z.string().cuid(),
  date: z.coerce.date(),
  location: z.string().min(3, "Le lieu est requis"),
});

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

    // Sécurité : Vérifier que les deux équipes sont dans le même tournoi
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
      },
    });

    revalidatePath(`/tournaments/${teamA.tournamentId}`);
    return { success: true, matchId: match.id };
  } catch (error) {
    return { error: "Erreur lors de la création du match." };
  }
}

export async function updateMatchScore(matchId: string, scoreA: number, scoreB: number) {
  try {
    // Vérifier ici si l'user est l'organisateur du tournoi lié
    await prisma.match.update({
      where: { id: matchId },
      data: { scoreA, scoreB },
    });

    revalidatePath("/matches");
    return { success: true };
  } catch (error) {
    return { error: "Erreur lors de la mise à jour du score." };
  }
}