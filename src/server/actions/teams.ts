"use server"

import { auth } from "@clerk/nextjs/server";
import prisma  from "@/lib/prisma";
import { teamSchema } from "@/lib/validations/teams";
import { revalidatePath } from "next/cache";

export async function createTeam(data: unknown) {
  const { userId } = await auth();
  const validatedFields = teamSchema.safeParse(data);

  if (!validatedFields.success || !userId) {
    return { error: "Données invalides ou non connecté" };
  }

  const { name, tournamentId, maxCapacity } = validatedFields.data;

  // Sécurité : Vérifier que l'user est l'organisateur de CE tournoi
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { organizerId: true }
  });

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });

  if (tournament?.organizerId !== dbUser?.id) {
    return { error: "Action non autorisée" };
  }

  await prisma.team.create({
    data: { name, tournamentId, maxCapacity }
  });

  revalidatePath(`/tournaments/${tournamentId}`);
  return { success: true };
}