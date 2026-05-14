import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// On définit params comme une Promise
export async function GET(
  req: Request, 
  { params }: { params: Promise<{ teamId: string }> } 
) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  // CRUCIAL : On doit attendre la résolution des paramètres
  const { teamId } = await params;

  const requests = await prisma.joinRequest.findMany({
    where: { 
      teamId: teamId, // On utilise la variable résolue
      paymentStatus: "PAID" 
    },
    include: {
      player: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(requests);
}