import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateToken } from "@/utils/tokenValidator";
import { defaultError } from "@/utils/defaultError";

export async function GET(req: NextRequest) {
  try {
    const validToken = await validateToken(req);

    const draft = await prisma.productDraft.findUnique({
      where: { userId: validToken.id },
    });

    return NextResponse.json(
      {
        draft: draft
          ? {
              ...draft,
              thumbnail: JSON.parse(
                draft?.thumbnail || '{"url": null, "id": null}'
              ),
              images: JSON.parse(draft?.images || "[]"),
            }
          : {
              name: "",
              description: "",
              price: 0,
              category: "",
              discount: 0,
              stock: 0,
              thumbnail: { url: null, id: null },
              images: [],
            },
      },
      { status: 200 }
    );
  } catch (error) {
    return defaultError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const validToken = await validateToken(req);

    const {
      name,
      thumbnail,
      images,
      description,
      discount,
      price,
      rating,
      stock,
      category,
    } = await req.json();

    await prisma.productDraft.upsert({
      where: { userId: validToken.id },
      update: {
        name,
        thumbnail: JSON.stringify(thumbnail),
        images: JSON.stringify(images),
        description,
        discount,
        price,
        rating,
        stock,
        category,
      },
      create: {
        userId: validToken.id,
        name,
        thumbnail: JSON.stringify(thumbnail),
        images: JSON.stringify(images),
        description,
        discount,
        price,
        rating,
        stock,
        category,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return defaultError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const validToken = await validateToken(req);

    await prisma.productDraft.delete({
      where: { userId: validToken.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return defaultError(error);
  }
}
