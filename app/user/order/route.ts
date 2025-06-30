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
      select: {
        id: true,
        total: true,
        status: true,
        createdAt: true,
        orderItems: {
          select: {
            id: true,
            quantity: true,
            price: true,
            amount: true,
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                thumbnail: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ orderItems: order }, { status: 200 });
  } catch (error) {
    return defaultError(error);
  }
}
