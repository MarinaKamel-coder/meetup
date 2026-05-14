import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request, 
  { params }: { params: { teamId?: string } } 
) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

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