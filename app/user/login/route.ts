import { prisma } from "@/lib/prisma";
import { defaultError } from "@/utils/defaultError";
import { comparePassword, createJWT } from "@/utils/security";
import { loginSchema } from "@/utils/validators/login";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const data = loginSchema.parse({ email, password });

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User with this email does not exist" },
        { status: 401 }
      );
    }

    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid password for this email address" },
        { status: 401 }
      );
    }

    const token = await createJWT({
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
    });

    return NextResponse.json(
      {
        token,
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
