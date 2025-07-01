import { prisma } from "@/lib/prisma";
import { productSchema } from "@/utils/validators/product";
import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/utils/tokenValidator";
import { defaultError } from "@/utils/defaultError";
import { validateProductWithAI } from "@/utils/ai-validators/product";
import cuid from "cuid";

export async function POST(req: NextRequest) {
  try {
    const validToken = await validateToken(req);

    const tokenUser = await prisma.user.findUnique({
      where: { id: validToken.id },
    });

    if (!tokenUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { draftId } = await req.json();

    if (!draftId) {
      return NextResponse.json(
        { error: "Draft ID is required" },
        { status: 400 }
      );
    }

    const draft = await prisma.productDraft.findUnique({
      where: { id: draftId, userId: tokenUser.id },
    });

    if (!draft) {
      return NextResponse.json(
        { error: "Draft not found or you do not have permission to access it" },
        { status: 404 }
      );
    }

    const { name, description, discount, price, stock, category } = draft;

    const productData = {
      name,
      description,
      discount,
      price,
      stock,
      category,
      userId: tokenUser.id,
    };

    const data = productSchema.parse(productData);

    await validateProductWithAI(data);

    const productId = cuid();

    const [product] = await prisma.$transaction([
      prisma.product.create({ data: { id: productId, ...data } }),
      prisma.image.updateMany({
        where: {
          draftId,
          userId: tokenUser.id,
        },
        data: {
          draftId: null,
          productId: productId,
        },
      }),
      prisma.productDraft.update({
        where: {
          id: draftId,
          userId: tokenUser.id,
        },
        data: {
          name: null,
          description: null,
          discount: null,
          price: null,
          stock: null,
          category: null,
        },
      }),
    ]);

    return NextResponse.json(
      {
        message: "Product created successfully",
        id: product.id,
      },
      { status: 200 }
    );
  } catch (error) {
    return defaultError(error);
  }
}
