import { prisma } from "@/lib/prisma";
import { validateJWT } from "@/utils/security";
import { JOSEError } from "jose/errors";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { error: "Authorization token is required" },
        { status: 401 }
      );
    }

    const validToken = await validateJWT(token);

    if (!validToken) {
      return NextResponse.json(
        { error: "Invalid or expired token", code: "er1001" },
        { status: 401 }
      );
    }

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
    if (error instanceof JOSEError) {
      return NextResponse.json(
        { error: "Expired or invalid token", code: "er1001" },
        { status: 401 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    const { name, lastName, email } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: "Authorization token is required" },
        { status: 401 }
      );
    }

    const validToken = await validateJWT(token);

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
    console.error(error);
    if (error instanceof JOSEError) {
      return NextResponse.json(
        { error: "Expired or invalid token", code: "er1001" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { error: "Authorization token is required" },
        { status: 401 }
      );
    }

    const validToken = await validateJWT(token);

    if (!validToken) {
      return NextResponse.json(
        { error: "Invalid or expired token", code: "er1001" },
        { status: 401 }
      );
    }

    await prisma.user.delete({
      where: { id: validToken.id },
    });

    return new NextResponse(null, {
      status: 204,
    });
  } catch (error) {
    if (error instanceof JOSEError) {
      return NextResponse.json(
        { error: "Expired or invalid token", code: "er1001" },
        { status: 401 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
