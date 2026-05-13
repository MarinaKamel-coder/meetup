import { auth } from "@clerk/nextjs/server";
import prisma  from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });

  const requests = await prisma.joinRequest.findMany({
    where: { playerId: dbUser?.id },
    include: {
      team: { include: { tournament: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(requests);
}