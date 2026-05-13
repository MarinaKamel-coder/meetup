// src/app/api/user/set-role/route.ts
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  const user = await currentUser();
  const { role } = await req.json();

  if (!userId || !user) return new NextResponse("Unauthorized", { status: 401 });

  await prisma.user.upsert({
    where: { clerkId: userId },
    create: {
      clerkId: userId,
      email: user.emailAddresses[0].emailAddress,
      fullName: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Utilisateur",
      role: role,
    },
    update: {
      role: role,
    },
  });

  return NextResponse.json({ success: true });
}
