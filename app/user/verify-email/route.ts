import { NextRequest, NextResponse } from "next/server";
import { validateEmailToken } from "@/utils/security";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "No token" }, { status: 400 });

  try {
    const { email } = await validateEmailToken(token);

    await prisma.user.update({
      where: { email },
      data: { status: "verified" },
    });

    return NextResponse.redirect(`${process.env.BASE_URL}/verified`);
  } catch (e) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 400 }
    );
  }
}
