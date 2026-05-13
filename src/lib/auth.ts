import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Role } from "@/app/generated/prisma/client";

/**
 * Récupère l'utilisateur actuel depuis Clerk et le synchronise avec la DB Prisma.
 * À utiliser dans les Server Components pour l'affichage du profil.
 */
export async function getDbUser() {
  const { userId } = await auth();
  if (!userId) return null;

  return await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { playerProfile: true },
  });
}

/**
 * Gardien de sécurité : Vérifie si l'utilisateur possède un rôle spécifique.
 * Si non, il redirige ou lance une erreur.
 * @param role - Le rôle requis (ADMIN, ORGANIZER, PLAYER)
 */
export async function requireRole(role: Role) {
  const user = await getDbUser();

  if (!user || user.role !== role) {
    // Si l'utilisateur est connecté mais n'a pas le bon rôle
    if (user) {
      redirect("/unauthorized"); 
    }
    // Si pas connecté du tout
    redirect("/sign-in");
  }

  return user;
}

/**
 * Helper rapide pour savoir si l'utilisateur est l'organisateur 
 * d'un tournoi spécifique (Sécurité critique pour les actions).
 */
export async function isTournamentOrganizer(tournamentId: string) {
  const user = await getDbUser();
  if (!user) return false;

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { organizerId: true },
  });

  return tournament?.organizerId === user.id || user.role === "ADMIN";
}