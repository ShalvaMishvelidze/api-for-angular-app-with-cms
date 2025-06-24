import { prisma } from "@/lib/prisma";
import { defaultError } from "@/utils/defaultError";
import { validateToken } from "@/utils/tokenValidator";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const validToken = await validateToken(req);

    if (!validToken) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const tokenUser = await prisma.user.findUnique({
      where: { id: validToken.id },
      select: { role: true },
    });

    if (tokenUser?.role !== "admin") {
      return NextResponse.json(
        { error: "You do not have permission to access this resource" },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany();

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return defaultError(error);
  }
}
