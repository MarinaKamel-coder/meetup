import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export async function GET(
  req: Request, 
  { params }: { params: { teamId?: string } } 
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    // 1. Extraction propre des paramètres
    const { searchParams } = new URL(req.url);
    const queryTeamId = searchParams.get("teamId");
    
    // On récupère le teamId (soit de l'URL dynamique, soit de la query string)
    const finalTeamId = params?.teamId || queryTeamId;

    // 2. Requête Prisma optimisée
    const requests = await prisma.joinRequest.findMany({
      where: { 
        ...(finalTeamId 
          ? { teamId: finalTeamId } 
          : { player: { clerkId: userId } }
        ),
        // On ne montre que les demandes pertinentes
        paymentStatus: { in: ["PAID", "PENDING", "NOT_REQUIRED"] }
      },
      include: {
        player: true,
        team: { 
          select: { name: true } 
        } 
      },
      orderBy: { 
        createdAt: 'desc' 
      }
    });

    return NextResponse.json(requests);

  } catch (error) {
    console.error("Erreur API JoinRequests:", error);
    return new NextResponse("Erreur serveur interne", { status: 500 });
  }
}