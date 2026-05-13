import prisma  from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tournamentId = searchParams.get("tournamentId");

  if (!tournamentId) return new NextResponse("ID manquant", { status: 400 });

  const teams = await prisma.team.findMany({
    where: { tournamentId },
    include: {
      _count: { select: { members: true } }
    }
  });

  return NextResponse.json(teams);
}