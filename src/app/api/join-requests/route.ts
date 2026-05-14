import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ teamId?: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const params = await context.params;

    const { searchParams } = new URL(req.url);
    const queryTeamId = searchParams.get("teamId");

    const finalTeamId = params.teamId || queryTeamId;

    const requests = await prisma.joinRequest.findMany({
      where: {
        ...(finalTeamId
          ? { teamId: finalTeamId }
          : { player: { clerkId: userId } }
        ),
        paymentStatus: { in: ["PAID", "PENDING", "NOT_REQUIRED"] }
      },
      include: {
        player: true,
        team: {
          select: { name: true }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(requests);

  } catch (error) {
    console.error("Erreur API JoinRequests:", error);
    return new NextResponse("Erreur serveur interne", { status: 500 });
  }
}