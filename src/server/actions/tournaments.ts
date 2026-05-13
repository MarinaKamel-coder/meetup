"use server"

import { auth } from "@clerk/nextjs/server";
import prisma  from "@/lib/prisma";
import { tournamentSchema } from "@/lib/validations/tournaments";
import { revalidatePath } from "next/cache";

export async function createTournament(formData: unknown) {
  try {
    // 1. Vérification de l'authentification et du rôle
    const { userId } = await auth();
    if (!userId) {
      return { error: "Vous devez être connecté pour créer un tournoi." };
    }

    // Récupérer l'utilisateur en base pour vérifier son rôle
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser || (dbUser.role !== "ORGANIZER" && dbUser.role !== "ADMIN")) {
      return { error: "Seuls les organisateurs peuvent créer des tournois." };
    }

    // 2. Validation des données avec Zod
    const validatedFields = tournamentSchema.safeParse(formData);

    if (!validatedFields.success) {
      return {
        error: "Données invalides.",
        details: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { name, sport, city, startDate, entryFee, currency } = validatedFields.data;

    // 3. Création dans la base de données Neon
    const tournament = await prisma.tournament.create({
      data: {
        name,
        sport,
        city,
        startDate,
        entryFee,
        currency,
        organizerId: dbUser.id, // On utilise l'ID interne Prisma, pas le clerkId
      },
    });

    revalidatePath("/tournaments");
    revalidatePath("/dashboard");

    return { success: true, tournamentId: tournament.id };
    
  } catch (error) {
    console.error("Erreur création tournoi:", error);
    return { error: "Une erreur interne est survenue lors de la création." };
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
 * Attention : Prisma doit gérer la suppression en cascade des équipes/matchs 
 * ou il faut les supprimer manuellement.
 */
export async function deleteTournament(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Non authentifié");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });

  const existingTournament = await prisma.tournament.findUnique({
    where: { id },
    select: { organizerId: true }
  });

  if (!existingTournament || (existingTournament.organizerId !== user?.id && user?.role !== "ADMIN")) {
    return { error: "Action non autorisée" };
  }

  try {
    await prisma.tournament.delete({
      where: { id },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Impossible de supprimer le tournoi (vérifiez s'il reste des équipes)" };
  }
}