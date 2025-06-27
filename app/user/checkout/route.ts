import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: body.items.map((item: any) => ({
        price_data: {
          currency: "usd",
          unit_amount: Math.round(item.price * 100), // cents
          product_data: {
            name: item.name,
          },
        },
        quantity: item.quantity,
      })),
      success_url: `${process.env.STRIPE_SUCCESS_URL}/success`,
      cancel_url: `${process.env.STRIPE_CANCEL_URL}/cancel`,
    });

    return NextResponse.json({ id: session.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to create session" },
      { status: 500 }
    );
  }
}
