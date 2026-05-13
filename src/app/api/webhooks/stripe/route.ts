import { stripe } from "@/lib/stripe";
import prisma  from "@/lib/prisma";
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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const joinRequestId = session.metadata?.joinRequestId;

    if (joinRequestId) {
      await prisma.joinRequest.update({
        where: { id: joinRequestId },
        data: {
          paymentStatus: "PAID",
          paidAt: new Date(),
          stripeSessionId: session.id,
        },
      });
    }
  }

  return new NextResponse(null, { status: 200 });
}