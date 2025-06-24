import { prisma } from "@/lib/prisma";
import { defaultError } from "@/utils/defaultError";
import { validateToken } from "@/utils/tokenValidator";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const validToken = await validateToken(req);
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

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return defaultError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const validToken = await validateToken(req);
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

    const { id } = await params;
    const { name, lastName, email } = await req.json();

    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        lastName,
        email,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return defaultError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const validToken = await validateToken(req);
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

    const { id } = await params;

    await prisma.user.delete({
      where: { id },
    });

    return new NextResponse(null, {
      status: 204,
    });
  } catch (error) {
    return defaultError(error);
  }
}
