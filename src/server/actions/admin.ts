import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateRole(formData: FormData) {
  const { userId: requesterClerkId } = await auth();
  if (!requesterClerkId) return { error: "Non authentifié" };

  // Sécurité : Seul un ADMIN peut changer les rôles
  const admin = await prisma.user.findUnique({ where: { clerkId: requesterClerkId } });
  if (admin?.role !== "ADMIN") return { error: "Action non autorisée" };

  const id = formData.get("userId") as string;
  const role = formData.get("role") as any;

  try {
    await prisma.user.update({ where: { id }, data: { role } });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { error: "Erreur lors de la mise à jour du rôle" };
  }
}