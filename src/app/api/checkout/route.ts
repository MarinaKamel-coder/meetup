import { stripe } from "@/lib/stripe";
import prisma  from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const { teamId, message } = await req.json();

    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return new NextResponse("User not found", { status: 404 });

    // 1. Vérifier si une demande n'est pas déjà en cours ou acceptée
    const existingRequest = await prisma.joinRequest.findFirst({
      where: {
        playerId: dbUser.id,
        teamId: teamId,
        status: { in: ["PENDING", "ACCEPTED"] }
      }
    });

    if (existingRequest) {
      return new NextResponse("Une demande est déjà en cours pour cette équipe", { status: 400 });
    }

    // 2. Récupérer les infos de l'équipe
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { tournament: true }
    });

    if (!team || team.tournament.entryFee <= 0) {
      return new NextResponse("Tournoi invalide ou gratuit", { status: 400 });
    }

    // 3. Créer la demande (Transaction Prisma pour la sécurité)
    const joinRequest = await prisma.joinRequest.create({
      data: {
        playerId: dbUser.id,
        teamId: team.id,
        message: message || "",
        paymentStatus: "PENDING",
      }
    });

    // 4. Session Stripe avec protection de devise
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: dbUser.email, // Pré-remplit l'email sur Stripe
      line_items: [{
        price_data: {
          currency: (team.tournament.currency || "CAD").toLowerCase(),
          product_data: {
            name: `Inscription : ${team.tournament.name}`,
            description: `Équipe : ${team.name}`,
          },
          unit_amount: team.tournament.entryFee,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&request_id=${joinRequest.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
      metadata: {
        joinRequestId: joinRequest.id,
        playerId: dbUser.id
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    return new NextResponse("Erreur lors de la création de la session de paiement", { status: 500 });
  }
}