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

    return NextResponse.json(
      {
        user: {
          id: tokenUser.id,
          name: tokenUser.name,
          lastName: tokenUser.lastName,
          email: tokenUser.email,
          role: tokenUser.role,
          status: tokenUser.status,
          createdAt: tokenUser.createdAt,
          updatedAt: tokenUser.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return defaultError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const validToken = await validateToken(req);
    const { name, lastName, email } = await req.json();

    const tokenUser = await prisma.user.update({
      where: { id: validToken.id },
      data: {
        name,
        lastName,
        email,
      },
    });

    if (!tokenUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        user: {
          id: tokenUser.id,
          name: tokenUser.name,
          lastName: tokenUser.lastName,
          email: tokenUser.email,
          role: tokenUser.role,
          status: tokenUser.status,
          createdAt: tokenUser.createdAt,
          updatedAt: tokenUser.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return defaultError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const validToken = await validateToken(req);

    await prisma.user.delete({
      where: { id: validToken.id },
    });

    return new NextResponse(null, {
      status: 204,
    });
  } catch (error) {
    return defaultError(error);
  }
}
