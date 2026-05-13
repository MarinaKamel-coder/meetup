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