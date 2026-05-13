"use server"

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { playerProfileSchema } from "@/lib/validations/player";
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

    // 2. Upsert User + Profile
    await prisma.user.upsert({
      where: { clerkId },
      create: {
        clerkId,
        email: "",
        fullName,
        role: "PLAYER",
        playerProfile: {
          create: {
            city,
            favoriteSport,
            level,
            position,
          },
        },
      },
      update: {
        fullName,
        playerProfile: {
          upsert: {
            update: {
              city,
              favoriteSport,
              level,
              position,
            },
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