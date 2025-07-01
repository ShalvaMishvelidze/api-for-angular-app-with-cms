import { prisma } from "@/lib/prisma";
import { productSchema } from "@/utils/validators/product";
import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/utils/tokenValidator";
import { defaultError } from "@/utils/defaultError";
import { validateProductWithAI } from "@/utils/ai-validators/product";

export async function POST(req: NextRequest) {
  try {
    const validToken = await validateToken(req);

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

    await validateProductWithAI(data);

    const product = await prisma.product.create({
      data: {
        ...data,
      },
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
    return defaultError(error);
  }
}
