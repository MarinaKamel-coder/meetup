import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export async function GET(
  req: Request, 
  { params }: { params: { teamId?: string } } 
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

  // --- RÉCUPÉRATION DU ID ---
  const { searchParams } = new URL(req.url);
  const queryTeamId = searchParams.get("teamId");
  
  // On prend teamId depuis params (si route dynamique) ou searchParams
  const finalTeamId = params.teamId || queryTeamId;

  const requests = await prisma.joinRequest.findMany({
    where: { 
      // Si on a un teamId, on filtre par équipe, 
      // sinon on montre les demandes du joueur connecté
      ...(finalTeamId 
        ? { teamId: finalTeamId } 
        : { player: { clerkId: userId } }
      ),
      paymentStatus: { in: ["PAID", "PENDING", "NOT_REQUIRED"] }
    },
    include: {
      player: true,
      team: { select: { name: true } } 
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(requests);
}