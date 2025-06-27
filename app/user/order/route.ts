import { prisma } from "@/lib/prisma";
import { defaultError } from "@/utils/defaultError";
import { validateToken } from "@/utils/tokenValidator";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const validToken = await validateToken(req);
    const tokenUser = await prisma.user.findUnique({
      where: { id: validToken.id },
    });
    if (!tokenUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = req.nextUrl;
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId, userId: tokenUser.id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(
      { orderItems: order?.orderItems },
      { status: 200 }
    );
  } catch (error) {
    return defaultError(error);
  }
}
