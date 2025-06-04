import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const userId = process.env.ADMIN_USER_ID;

  const response = await fetch("https://dummyjson.com/products?limit=100");
  const data = await response.json();

  if (userId) {
    for (const product of data.products) {
      await prisma.product.create({
        data: {
          name: product.title,
          thumbnail: product.thumbnail,
          images: JSON.stringify(product.images),
          description: product.description,
          discount: Math.round(product.discountPercentage) || 0,
          price: product.price,
          rating: product.rating,
          stock: product.stock,
          category: product.category,
          userId,
        },
      });
    }
  }

  return NextResponse.json({ message: "Seed successful!" });
}
