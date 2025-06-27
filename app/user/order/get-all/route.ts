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
    const orders = await prisma.order.findMany({
      where: { userId: tokenUser.id },
      select: {
        id: true,
        status: true,
        total: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    return defaultError(error);
  }
}
