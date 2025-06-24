import { sendEmail } from "@/lib/sendEmail";
import { defaultError } from "@/utils/defaultError";
import { createEmailToken } from "@/utils/security";
import { validateToken } from "@/utils/tokenValidator";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const validToken = await validateToken(req);

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
    return defaultError(error);
  }
}
