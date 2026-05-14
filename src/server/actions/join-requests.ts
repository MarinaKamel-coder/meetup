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
  // On autorise l'ORGANIZER et l'ADMIN à accepter
  if (!dbUser || (dbUser.role !== "ORGANIZER" && dbUser.role !== "ADMIN")) {
    return { error: "Interdit" };
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const request = await tx.joinRequest.findUnique({
        where: { id: requestId },
        include: { 
          team: { 
            include: { 
              tournament: true, // Pour vérifier si un frais est requis
              _count: { select: { members: true } } 
            } 
          } 
        }
      });

      if (!request || request.status !== "PENDING") {
        throw new Error("Demande invalide");
      }

      // --- SÉCURITÉ CRITIQUE : LE VERROU DE PAIEMENT ---
      // On autorise l'acceptation si c'est payé OU si c'est en attente (pour permettre la validation manuelle)
      const isPaymentValid = request.team.tournament.entryFee === 0 || 
                            request.paymentStatus === "PAID" || 
                            request.paymentStatus === "PENDING";

      if (!isPaymentValid) {
        throw new Error("Le statut de paiement ne permet pas d'accepter cette demande.");
      }

      if (request.team._count.members >= request.team.maxCapacity) {
        throw new Error("L'équipe est complète !");
      }

      // Mise à jour du statut de la demande
      await tx.joinRequest.update({
        where: { id: requestId },
        data: { status: "ACCEPTED" }
      });

      // Connexion du joueur à l'équipe
      await tx.team.update({
        where: { id: request.teamId },
        data: { members: { connect: { id: request.playerId } } }
      });

      revalidatePath("/admin/tournaments/[id]", "page");
      revalidatePath("/(player)/my-requests");
      
      return { success: true };
    });
  } catch (e: any) {
    return { error: e.message || "Une erreur est survenue" };
  }
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

    revalidatePath("/(player)/my-requests");
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

  revalidatePath("/(organizer)/requests");
  revalidatePath("/(player)/my-requests");
  return { success: true };
} 