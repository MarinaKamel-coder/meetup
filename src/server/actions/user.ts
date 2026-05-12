"use server"

import { auth } from "@clerk/nextjs/server";
import  prisma  from "@/src/lib/prisma";
import { playerProfileSchema } from "@/src/lib/validations/player";
import { revalidatePath } from "next/cache";

export async function updatePlayerProfile(data: unknown) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { error: "Non connecté" };

    // 1. Validation Zod
    const validatedFields = playerProfileSchema.safeParse(data);
    if (!validatedFields.success) {
      return { error: "Données invalides", details: validatedFields.error.flatten().fieldErrors };
    }

    const { fullName, city, favoriteSport, level, position } = validatedFields.data;

    // 2. Mise à jour atomique (User + Profile)
    await prisma.user.update({
      where: { clerkId },
      data: {
        fullName, // On met à jour le nom dans la table User
        playerProfile: {
          upsert: {
            // Si le profil existe, on le met à jour
            update: {
              city,
              favoriteSport,
              level,
              position,
            },
            // S'il n'existe pas, on le crée
            create: {
              city,
              favoriteSport,
              level,
              position,
            },
          },
        },
      },
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Erreur profile update:", error);
    return { error: "Une erreur est survenue lors de la mise à jour." };
  }
}