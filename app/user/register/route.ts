import { prisma } from "@/lib/prisma";
import { defaultError } from "@/utils/defaultError";
import { createJWT, hashPassword } from "@/utils/security";
import { registerSchema } from "@/utils/validators/register";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const { name, lastName, email, password, confirmPassword } =
      await req.json();

    const userExists = await prisma.user.findUnique({
      where: { email },
    });
    if (userExists) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    const registerUser = { name, lastName, email, password, confirmPassword };
    const data = registerSchema.parse(registerUser);

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        lastName: data.lastName,
        email: data.email,
        password: hashedPassword,
      },
    });

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
      { status: 201 }
    );
  } catch (error) {
    return defaultError(error);
  }
}
