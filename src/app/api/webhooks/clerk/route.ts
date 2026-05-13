// src/app/api/webhooks/clerk/route.ts
import { Webhook } from "svix";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET!;
  if (!secret) {
    return new Response("CLERK_WEBHOOK_SECRET manquant", { status: 500 });
  }

  const payload = await req.text();
  const h = await headers();

  // Vérification de la signature Svix
  const wh = new Webhook(secret);
  let evt: { type: string; data: Record<string, unknown> };

  try {
    evt = wh.verify(payload, {
      "svix-id": h.get("svix-id")!,
      "svix-timestamp": h.get("svix-timestamp")!,
      "svix-signature": h.get("svix-signature")!,
    }) as { type: string; data: Record<string, unknown> };
  } catch (err) {
    console.error("Signature Svix invalide:", err);
    return new Response("Signature invalide", { status: 400 });
  }  
if (evt.type === "user.created" || evt.type === "user.updated") {
  const data = evt.data as {
    id: string;
    email_addresses: { email_address: string }[];
    first_name?: string;
    last_name?: string;
  };

  const email = data.email_addresses?.[0]?.email_address ?? "";
  const fullName = `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim() || "Utilisateur";

  await prisma.user.upsert({
    where: { clerkId: data.id },
    create: {
      clerkId: data.id,
      email,
      fullName,
      role: "PLAYER",
    },
    update: {
      email,
      fullName,
    },
  });

  console.log(`✅ User ${evt.type === "user.created" ? "créé" : "mis à jour"}: ${email}`);
}

if (evt.type === "user.deleted") {
  const data = evt.data as { id: string };
  await prisma.user.deleteMany({ where: { clerkId: data.id } });
  console.log(`🗑️ User supprimé: ${data.id}`);
}
  

  return new Response("ok", { status: 200 });
}