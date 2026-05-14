"use server"

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { teamSchema } from "@/lib/validations/teams";
import { revalidatePath } from "next/cache";

// --- CRÉATION ---
export async function createTeam(data: unknown) {
  const { userId } = await auth();
  const validatedFields = teamSchema.safeParse(data);

  if (!validatedFields.success || !userId) {
    return { error: "Données invalides ou non connecté" };
  }

  const { name, tournamentId, maxCapacity } = validatedFields.data;

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { organizerId: true }
  });

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });

  if (tournament?.organizerId !== dbUser?.id && dbUser?.role !== "ADMIN") {
    return { error: "Action non autorisée" };
  }

  await prisma.team.create({
    data: { name, tournamentId, maxCapacity }
  });

  revalidatePath(`/tournaments/${tournamentId}`);
  revalidatePath("/admin"); 
  return { success: true };
} 

// --- MISE À JOUR ---
export async function updateTeam(id: string, data: { name?: string; maxCapacity?: number }) {
  const { userId } = await auth();
  if (!userId) return { error: "Non connecté" };

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return { error: "Utilisateur introuvable" };

  const team = await prisma.team.findUnique({
    where: { id },
    include: { tournament: { select: { organizerId: true } } },
  });

  if (!team || (team.tournament.organizerId !== dbUser.id && dbUser.role !== "ADMIN")) {
    return { error: "Action non autorisée" };
  }

  await prisma.team.update({
    where: { id },
    data: {
      name: data.name,
      maxCapacity: data.maxCapacity,
    },
  });

  revalidatePath(`/tournaments/${team.tournamentId}`);
  revalidatePath("/admin");
  return { success: true };
} 

// --- SUPPRESSION  ---
export async function deleteTeam(teamId: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Non connecté" };

  const id = teamId;

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return { error: "Utilisateur introuvable" };

  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      tournament: { select: { organizerId: true } },
      _count: { select: { members: true } },
    },
  });

  if (!team || (team.tournament.organizerId !== dbUser.id && dbUser.role !== "ADMIN")) {
    return { error: "Action non autorisée" };
  }

  if (team._count.members > 0 && dbUser.role !== "ADMIN") {
    return { error: "Impossible de supprimer une équipe avec des joueurs inscrits" };
  }

  await prisma.team.delete({ where: { id } });

  revalidatePath(`/tournaments/${team.tournamentId}`);
  revalidatePath("/admin"); // Crucial pour mettre à jour les compteurs de l'admin
  return { success: true };
}

// --- RETIRER UN MEMBRE ---

export async function removeMemberFromTeam(teamId: string, memberId: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Non connecté" };

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return { error: "Utilisateur introuvable" };

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { tournament: { select: { organizerId: true } } },
  });

  if (!team || (team.tournament.organizerId !== dbUser.id && dbUser.role !== "ADMIN")) {
    return { error: "Action non autorisée" };
  }

  // Retirer le joueur de l'équipe
  await prisma.team.update({
    where: { id: teamId },
    data: { members: { disconnect: { id: memberId } } },
  });

  // Remettre la demande en PENDING ou la supprimer
  await prisma.joinRequest.updateMany({
    where: { playerId: memberId, teamId },
    data: { status: "REJECTED" },
  });

  revalidatePath(`/tournaments/${team.tournamentId}`);
  return { success: true };
}
