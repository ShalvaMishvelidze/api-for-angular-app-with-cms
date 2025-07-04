import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category: true,
        thumbnail: true,
        images: true,
        discount: true,
        stock: true,
        rating: true,
      },
    });

    return NextResponse.json(
      {
        ...product,
        thumbnail: JSON.parse(
          product?.thumbnail || '{"url": null, "id": null}'
        ),
        images: JSON.parse(product?.images || "[]"),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
