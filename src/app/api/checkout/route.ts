import { stripe } from "@/lib/stripe";
import prisma  from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const { teamId, message } = await req.json();

    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    // 1. Récupérer les infos de l'équipe et du tournoi
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { tournament: true }
    });

    if (!team || team.tournament.entryFee <= 0) {
      return new NextResponse("Invalid Tournament", { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return new NextResponse("User not found", { status: 404 });

    // 2. Créer la demande en PENDING
    const joinRequest = await prisma.joinRequest.create({
      data: {
        playerId: dbUser.id,
        teamId: team.id,
        message: message,
        paymentStatus: "PENDING",
      }
    });

    // 3. Créer la session Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: team.tournament.currency.toLowerCase(),
          product_data: {
            name: `Inscription: ${team.tournament.name} - Équipe ${team.name}`,
          },
          unit_amount: team.tournament.entryFee, // Déjà en centimes
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
      metadata: {
        joinRequestId: joinRequest.id, // CRITIQUE pour le webhook
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}