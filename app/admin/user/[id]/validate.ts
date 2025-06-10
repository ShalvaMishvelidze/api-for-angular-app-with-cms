import { prisma } from "@/lib/prisma";
import { validateJWT } from "@/utils/security";
import { NextResponse } from "next/server";

export const validate = async (token: string | undefined, id: string) => {
  if (!token) {
    return NextResponse.json(
      { error: "Authorization token is required" },
      { status: 401 }
    );
  }

  const validToken = await validateJWT(token);

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

  if (tokenUser?.role !== "admin" || id !== validToken.id) {
    return NextResponse.json(
      { error: "You do not have permission to access this user" },
      { status: 403 }
    );
  }
};
