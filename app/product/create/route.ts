import { prisma } from "@/lib/prisma";
import { validateJWT } from "@/utils/security";
import { productSchema } from "@/utils/validators/product";
import { JOSEError } from "jose/errors";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { error: "Authorization token is required" },
        { status: 401 }
      );
    }

    const validToken = await validateJWT(token);

    const tokenUser = await prisma.user.findUnique({
      where: { id: validToken.id },
    });

    if (!tokenUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const {
      name,
      thumbnail,
      images,
      description,
      discount,
      price,
      stock,
      category,
    } = await req.json();

    const productData = {
      name,
      thumbnail: JSON.stringify(thumbnail),
      images: JSON.stringify(images),
      description,
      discount,
      price,
      stock,
      category,
      userId: tokenUser.id,
    };

    const data = productSchema.parse(productData);

    const product = await prisma.product.create({
      data: {
        ...data,
      },
    });

    await prisma.productDraft.delete({
      where: { userId: tokenUser.id },
    });

    return NextResponse.json(
      {
        product: {
          ...product,
          thumbnail: JSON.parse(product.thumbnail || "{url: null, id: null}"),
          images: JSON.parse(product.images || "[]"),
        },
      },
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
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.errors.map((err) => err.message) },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
