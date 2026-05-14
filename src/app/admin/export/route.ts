import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();

  // 1. Sécurité : Vérifier si l'utilisateur est ADMIN
  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId as string } });
  if (!dbUser || dbUser.role !== "ADMIN") {
    return new NextResponse("Non autorisé", { status: 403 });
  }

  // 2. Récupérer les données
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  // 3. Construire le contenu CSV
  // Header
  const header = ["ID", "Nom complet", "Email", "Role", "Date inscription"].join(",");
  
  // Lignes
  const rows = users.map((u) => {
    return [
      u.id,
      `"${u.fullName}"`, 
      u.email,
      u.role,
      u.createdAt.toISOString(),
    ].join(",");
  });

  const csvContent = [header, ...rows].join("\n");

  // 4. Retourner le fichier
  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="utilisateurs-meetup-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}