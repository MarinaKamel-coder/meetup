import prisma  from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const sport = searchParams.get("sport");

  const tournaments = await prisma.tournament.findMany({
    where: {
      city: city || undefined,
      sport: sport || undefined,
    },
    include: {
      _count: { select: { teams: true } }
    },
    orderBy: { startDate: 'asc' }
  });

  return NextResponse.json(tournaments);
}