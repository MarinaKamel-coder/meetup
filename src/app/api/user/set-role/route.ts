import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  const user = await currentUser();
  const { role } = await req.json();

  if (!userId || !user) return new NextResponse("Unauthorized", { status: 401 });

  await prisma.user.upsert({
    data: {
      clerkId: userId,
      email: user.emailAddresses[0].emailAddress,
      fullName: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
      role: role, // PLAYER ou ORGANIZER selon le clic du bouton
    },
  });

  return NextResponse.json({ success: true });
}