import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as any;
  const joinRequestId = session.metadata?.joinRequestId;

  if (!joinRequestId) {
    return new NextResponse("No metadata found", { status: 200 });
  }

  // 1. LE PAIEMENT EST RÉUSSI
  if (event.type === "checkout.session.completed") {
    await prisma.joinRequest.update({
      where: { id: joinRequestId },
      data: {
        paymentStatus: "PAID",
        paidAt: new Date(),
        stripeSessionId: session.id,
      },
    });
    console.log(`✅ Payment confirmed for request: ${joinRequestId}`);
  }

  // 2. LE PAIEMENT A ÉCHOUÉ OU EXPIRED (L'utilisateur a fermé la page ou sa carte a été refusée)
  if (event.type === "checkout.session.expired" || event.type === "payment_intent.payment_failed") {
    await prisma.joinRequest.update({
      where: { id: joinRequestId },
      data: {
        paymentStatus: "FAILED", // Change "PENDING" en "FAILED"
      },
    });
    console.log(`❌ Payment failed/expired for request: ${joinRequestId}`);
  }

  return new NextResponse(null, { status: 200 });
}