import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { validateToken } from "@/utils/tokenValidator";
import { defaultError } from "@/utils/defaultError";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function DELETE(req: NextRequest) {
  try {
    await validateToken(req);
    const publicIds = await req.json();

    await cloudinary.api.delete_resources(publicIds, {
      invalidate: true,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("Failed to delete image(s):", error);
    return defaultError(error);
  }
}
