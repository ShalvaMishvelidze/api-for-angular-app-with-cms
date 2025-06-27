import { prisma } from "@/lib/prisma";
import { defaultError } from "@/utils/defaultError";
import { validateToken } from "@/utils/tokenValidator";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const validToken = await validateToken(req);
    const tokenUser = await prisma.user.findUnique({
      where: { id: validToken.id },
    });

    if (!tokenUser) {
      return NextResponse.json({ msg: "User not found" }, { status: 404 });
    }

    const { orderId } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order || order.userId !== tokenUser.id) {
      return NextResponse.json({ msg: "Not found" }, { status: 404 });
    }

    if (order.status === "refunded") {
      return NextResponse.json({ msg: "Already refunded" }, { status: 400 });
    }

    if (!order.paymentIntentId) {
      return NextResponse.json(
        { msg: "No payment intent found for this order" },
        { status: 400 }
      );
    }
    const refund = await stripe.refunds.create({
      payment_intent: order.paymentIntentId,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { status: "refunded" },
    });

    return NextResponse.json({ success: true, refund }, { status: 200 });
  } catch (error) {
    return defaultError(error);
  }
}
