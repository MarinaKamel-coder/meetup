import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { teamId: string } }) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  // 1. On récupère toutes les demandes pour cette équipe
  const requests = await prisma.joinRequest.findMany({
    where: { 
      teamId: params.teamId,
      paymentStatus: "PAID" 
    },
    include: {
      player: true // Pour voir qui veut rejoindre
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(requests);
}