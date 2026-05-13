"use server"

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createJoinRequest(teamId: string, message?: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Non connecté" };

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return { error: "Utilisateur introuvable" };

  try {
    await prisma.joinRequest.create({
      data: {
        playerId: dbUser.id,
        teamId: teamId,
        message: message,
        paymentStatus: "NOT_REQUIRED"
      }
    });
    revalidatePath("/teams");
    return { success: true };
  } catch (e) {
    return { error: "Vous avez déjà postulé pour cette équipe." };
  }
}

export async function acceptJoinRequest(requestId: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Non connecté" };

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser || dbUser.role !== "ORGANIZER") return { error: "Interdit" };

  return await prisma.$transaction(async (tx) => {
    const request = await tx.joinRequest.findUnique({
      where: { id: requestId },
      include: { team: { include: { _count: { select: { members: true } } } } }
    });

    if (!request || request.status !== "PENDING") {
      throw new Error("Demande invalide");
    }

    if (request.team._count.members >= request.team.maxCapacity) {
      throw new Error("L'équipe est complète !");
    }

    await tx.joinRequest.update({
      where: { id: requestId },
      data: { status: "ACCEPTED" }
    });

    await tx.team.update({
      where: { id: request.teamId },
      data: { members: { connect: { id: request.playerId } } }
    });

    return { success: true };
  });
}

export async function cancelJoinRequest(requestId: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Vous devez être connecté." };

    const request = await prisma.joinRequest.findUnique({
      where: { id: requestId },
      include: {
        player: { select: { clerkId: true } },
        team: { select: { tournamentId: true } }
      }
    });

    if (!request) return { error: "Demande introuvable." };

    if (request.player.clerkId !== userId) {
      return { error: "Action non autorisée." };
    }

    if (request.status !== "PENDING") {
      return { error: "Cette demande a déjà été traitée et ne peut plus être annulée." };
    }

    await prisma.joinRequest.delete({ where: { id: requestId } });

    revalidatePath("/my-requests");
    revalidatePath(`/teams/${request.teamId}`);

    return { success: true };
  } catch (error) {
    console.error("Erreur annulation demande:", error);
    return { error: "Une erreur est survenue lors de l'annulation." };
  }
} 

export async function rejectJoinRequest(requestId: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Non connecté" };

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser || dbUser.role !== "ORGANIZER") return { error: "Interdit" };

  await prisma.joinRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED" },
  });

  revalidatePath("/requests");
  revalidatePath("/my-requests");
  return { success: true };
} 