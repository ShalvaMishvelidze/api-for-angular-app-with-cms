import { prisma } from "@/lib/prisma";
import { defaultError } from "@/utils/defaultError";
import { validateToken } from "@/utils/tokenValidator";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function POST(req: NextRequest) {
  try {
    const validToken = await validateToken(req);
    const tokenUser = await prisma.user.findUnique({
      where: { id: validToken.id },
    });
    if (!tokenUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const body = await req.json();
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
    return defaultError(error);
  }
}
