import { prisma } from "@/lib/prisma";
import { defaultError } from "@/utils/defaultError";
import { validateToken } from "@/utils/tokenValidator";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    // const validToken = await validateToken(req);
    // const tokenUser = await prisma.user.findUnique({
    //   where: { id: validToken.id },
    // });

    // if (!tokenUser) {
    //   return NextResponse.json({ error: "User not found" }, { status: 404 });
    // }

    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    return defaultError(error);
  }
}
