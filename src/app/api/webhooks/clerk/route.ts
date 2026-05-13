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
  let evt: { type: string; data: any };

  try {
    evt = wh.verify(payload, {
      "svix-id": h.get("svix-id")!,
      "svix-timestamp": h.get("svix-timestamp")!,
      "svix-signature": h.get("svix-signature")!,
    }) as { type: string; data: any };
  } catch (err) {
    console.error("Signature Svix invalide:", err);
    return new Response("Signature invalide", { status: 400 });
  }

  // Traitement des événements
  if (evt.type === "user.created" || evt.type === "user.updated") {
    const { id, email_addresses, first_name, last_name } = evt.data;

    const email = email_addresses?.[0]?.email_address ?? "";
    const fullName = `${first_name ?? ""} ${last_name ?? ""}`.trim() || "Utilisateur";

    await prisma.user.upsert({
      where: { clerkId: id },
      create: {
        clerkId: id,
        email,
        fullName,
        role: "PLAYER", // rôle par défaut
      },
      update: {
        email,
        fullName,
      },
    });

    console.log(`✅ User ${evt.type === "user.created" ? "créé" : "mis à jour"}: ${email}`);
  }

  if (evt.type === "user.deleted") {
    const { id } = evt.data;
    await prisma.user.deleteMany({ where: { clerkId: id } });
    console.log(`🗑️ User supprimé: ${id}`);
  }

  return new Response("ok", { status: 200 });
}