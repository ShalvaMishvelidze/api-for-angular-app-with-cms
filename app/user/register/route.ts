import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/sendEmail";
import { createEmailToken, createJWT, hashPassword } from "@/utils/security";
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

    const emailToken = await createEmailToken({
      email: user.email,
      purpose: "verify-email",
    });

    const link = `${process.env.BASE_URL}/user/verify-email?token=${emailToken}`;

    await sendEmail({
      to: user.email,
      subject: "Verify your email",
      html: `<p>Hi ${user.name},</p>
             <p>Thank you for registering. Please verify your email by clicking the link below:</p>
             <a href="${link}">Verify Email</a>
             <p>If you did not register, please ignore this email.</p>`,
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
