import { prisma } from "@/lib/prisma";
import { defaultError } from "@/utils/defaultError";
import { validateToken } from "@/utils/tokenValidator";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    const validToken = await validateToken(req);

    await prisma.cart.deleteMany({
      where: {
        userId: validToken.id,
      },
    });

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return defaultError(error);
  }
}
