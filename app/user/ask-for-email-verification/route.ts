import { sendEmail } from "@/lib/sendEmail";
import { createEmailToken, validateJWT } from "@/utils/security";
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

    const emailToken = await createEmailToken({
      email: validToken.email,
      purpose: "verify-email",
    });

    const link = `${process.env.BASE_URL}/user/verify-email?token=${emailToken}`;

    await sendEmail({
      to: validToken.email,
      subject: "Verify your email",
      html: `<p>Hi ${validToken.name},</p>
               <p>Thank you for registering. Please verify your email by clicking the link below:</p>
               <a href="${link}">Verify Email</a>
               <p>If you did not register, please ignore this email.</p>`,
    });

    return NextResponse.json(
      { message: "Successfully sent verification link" },
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
