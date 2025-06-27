import { prisma } from "@/lib/prisma";
import { defaultError } from "@/utils/defaultError";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = session.metadata?.userId;
      const paymentIntentId = session.payment_intent as string;

      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id,
        { expand: ["data.price.product"] }
      );

      const orderItems = lineItems.data.map((item) => ({
        productId: (item.price?.product as Stripe.Product)?.metadata
          ?.productId as string,
        quantity: item.quantity || 1,
        price: (item.amount_total || 0) / (item.quantity || 1) / 100,
        amount: (item.amount_total || 0) / 100,
      }));

      const total = orderItems.reduce((sum, item) => sum + item.amount, 0);

      if (!userId) {
        return NextResponse.json(
          { error: "User ID is missing in session metadata" },
          { status: 400 }
        );
      }

      await prisma.order.create({
        data: {
          userId,
          total,
          status: "paid",
          paymentIntentId,
          orderItems: {
            createMany: { data: orderItems },
          },
        },
      });
    }

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    return defaultError(error);
  }
}
