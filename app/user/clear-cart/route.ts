import { defaultError } from "@/utils/defaultError";
import { validateToken } from "@/utils/tokenValidator";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    const validToken = await validateToken(req);
    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    return defaultError(error);
  }
}
