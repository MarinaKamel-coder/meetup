"use server"

import { auth } from "@clerk/nextjs/server";
import prisma  from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. Envoyer une demande (Joueur)
export async function createJoinRequest(teamId: string, message?: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Non connecté" };

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return { error: "Utilisateur introuvable" };

  try {
    const request = await prisma.joinRequest.create({
      data: {
        playerId: dbUser.id,
        teamId: teamId,
        message: message,
        // Si tournoi gratuit -> NOT_REQUIRED, sinon PENDING 
        paymentStatus: "NOT_REQUIRED" 
      }
    });
    revalidatePath("/teams");
    return { success: true };
  } catch (e) {
    return { error: "Vous avez déjà postulé pour cette équipe." };
  }
}

// 2. Accepter une demande (Organisateur) - LA TRANSACTION CRITIQUE
export async function acceptJoinRequest(requestId: string) {
  return await prisma.$transaction(async (tx) => {
    // 1. Récupérer la demande et les infos d'équipe
    const request = await tx.joinRequest.findUnique({
      where: { id: requestId },
      include: { team: { include: { _count: { select: { members: true } } } } }
    });

    if (!request || request.status !== "PENDING") {
      throw new Error("Demande invalide");
    }

    // 2. Vérifier la capacité
    if (request.team._count.members >= request.team.maxCapacity) {
      throw new Error("L'équipe est complète !");
    }

    // 3. Accepter et lier le joueur à l'équipe
    await tx.joinRequest.update({
      where: { id: requestId },
      data: { status: "ACCEPTED" }
    });

    await tx.team.update({
      where: { id: request.teamId },
      data: {
        members: { connect: { id: request.playerId } }
      }
    });

    return { success: true };
  });
}