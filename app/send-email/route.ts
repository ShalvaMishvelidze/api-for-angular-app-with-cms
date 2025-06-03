import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(req: NextRequest) {
  const { to, subject, html } = await req.json();

  try {
    await sendEmail({ to, subject, html });
    return NextResponse.json({ message: "Email sent" });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
