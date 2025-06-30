import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const related = await prisma.product.findMany({
      where: {
        category: product.category,
        status: "active",
        NOT: { id },
      },
      take: 4,
      orderBy: {
        rating: "desc",
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        thumbnail: true,
        rating: true,
      },
    });

    return NextResponse.json({ related }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
