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
          thumbnail: JSON.stringify({
            url: product.thumbnail,
            id: Math.random().toString(36).substring(2, 15),
          }),
          images: JSON.stringify(
            product.images.map((image: string) => ({
              url: image,
              id: Math.random().toString(36).substring(2, 15),
            }))
          ),
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
