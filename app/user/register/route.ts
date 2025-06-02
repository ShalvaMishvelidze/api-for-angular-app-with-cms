import { prisma } from "@/lib/prisma";
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

    return NextResponse.json({ token, user }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.errors.map((err) => err.message) },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
