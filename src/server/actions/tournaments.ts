"use server"

import { auth } from "@clerk/nextjs/server";
import prisma  from "@/lib/prisma";
import { tournamentSchema } from "@/lib/validations/tournaments";
import { revalidatePath } from "next/cache";

export async function createTournament(formData: unknown) {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Vous devez être connecté." };

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser || (dbUser.role !== "ORGANIZER" && dbUser.role !== "ADMIN")) {
      return { error: "Autorisation insuffisante." };
    }

    const validatedFields = tournamentSchema.safeParse(formData);
    if (!validatedFields.success) {
      return { error: "Données invalides.", details: validatedFields.error.flatten().fieldErrors };
    }

    const { name, sport, city, startDate, entryFee, currency } = validatedFields.data;

    const tournament = await prisma.tournament.create({
      data: {
        name, sport, city, startDate, entryFee, currency,
        organizerId: dbUser.id,
      },
    });

    revalidatePath("/tournaments");
    revalidatePath("/admin"); // On rafraîchit l'admin aussi
    return { success: true, tournamentId: tournament.id };
  } catch (error) {
    return { error: "Erreur interne lors de la création." };
  }
}

export async function updateTournament(id: string, data: any) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non authentifié");

  // 1. Vérifier que le tournoi appartient bien à l'utilisateur
  const existingTournament = await prisma.tournament.findUnique({
    where: { id },
    select: { organizerId: true }
  });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });

  if (!existingTournament || (existingTournament.organizerId !== user?.id && user?.role !== "ADMIN")) {
    return { error: "Action non autorisée" };
  }

  // 2. Mise à jour
  try {
    await prisma.tournament.update({
      where: { id },
      data: {
        name: data.name,
        sport: data.sport,
        city: data.city,
        entryFee: data.entryFee, 
      },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/tournaments/${id}`);
    return { success: true };
  } catch (error) {
    return { error: "Erreur lors de la mise à jour" };
  }
}

/**
 * Suppression d'un tournoi
 */
export async function deleteTournament(tournamentId: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Non authentifié" };

  const id = tournamentId;
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });

  const existingTournament = await prisma.tournament.findUnique({
    where: { id },
    select: { organizerId: true }
  });

  if (!existingTournament || (existingTournament.organizerId !== user?.id && user?.role !== "ADMIN")) {
    return { error: "Action non autorisée" };
  }

  try {
    await prisma.tournament.delete({ where: { id } });
    revalidatePath("/admin");
    revalidatePath("/tournaments");
    return { success: true };
  } catch (error) {
    return { error: "Erreur lors de la suppression." };
  }
}