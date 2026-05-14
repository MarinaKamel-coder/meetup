import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

// On utilise NextRequest et on rend teamId optionnel (?) dans le type
export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ teamId?: string }> } 
) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Non autorisé", { status: 401 });

  // On attend la résolution des paramètres
  const resolvedParams = await params;
  const teamId = resolvedParams.teamId;

  // Si tu passes le teamId par l'URL (ex: ?teamId=123), 
  // on le récupère via searchParams au cas où le dossier n'est pas dynamique
  const { searchParams } = new URL(request.url);
  const queryTeamId = searchParams.get("teamId");

  const finalTeamId = teamId || queryTeamId;

  const requests = await prisma.joinRequest.findMany({
    where: { 
      // On filtre par teamId s'il existe, sinon on montre les requêtes de l'utilisateur
      ...(finalTeamId ? { teamId: finalTeamId } : { player: { clerkId: userId } }),
      paymentStatus: "PAID" 
    },
    include: {
      player: true,
      team: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(requests);
}