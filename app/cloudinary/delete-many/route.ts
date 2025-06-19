import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function DELETE(req: NextRequest) {
  try {
    // User validation can be added here in the future
    const body = await req.json();
    const publicIds = body.publicIds ?? (body.publicId ? [body.publicId] : []);

    await cloudinary.api.delete_resources(publicIds, {
      invalidate: true,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("Failed to delete image(s):", error);
    return NextResponse.json(
      { error: "Failed to delete image(s)", details: error.message },
      { status: 500 }
    );
  }
}
