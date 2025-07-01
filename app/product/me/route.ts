import { prisma } from "@/lib/prisma";
import { validateProductWithAI } from "@/utils/ai-validators/product";
import { defaultError } from "@/utils/defaultError";
import { validateToken } from "@/utils/tokenValidator";
import { productSchema } from "@/utils/validators/product";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const validToken = await validateToken(req);

    const { searchParams } = req.nextUrl;
    const rawSearch = searchParams.get("search")?.trim() || "";
    const search = rawSearch.length > 100 ? rawSearch.slice(0, 100) : rawSearch;

    const tokenUser = await prisma.user.findUnique({
      where: { id: validToken.id },
    });

    if (!tokenUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const tokenUserProducts = await prisma.product.findMany({
      where: { userId: validToken.id, name: { contains: search } },
    });

    const formattedProducts = tokenUserProducts.map((product) => {
      return {
        ...product,
        thumbnail: JSON.parse(product.thumbnail || "{url: null, id: null}"),
        images: JSON.parse(product.images || "[]"),
      };
    });

    return NextResponse.json(
      {
        products: formattedProducts,
      },
      { status: 200 }
    );
  } catch (error) {
    return defaultError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const validToken = await validateToken(req);

    const tokenUser = await prisma.user.findUnique({
      where: { id: validToken.id },
    });

    if (!tokenUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const {
      id,
      name,
      thumbnail,
      images,
      description,
      discount,
      price,
      stock,
      category,
      status,
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
      status,
      userId: validToken.id,
    };

    const data = productSchema.parse(productData);

    await validateProductWithAI(data);

    const newImages = JSON.parse(data.images || "[]");
    const newThumbnail = JSON.parse(data.thumbnail);

    const oldProduct = await prisma.product.findUnique({
      where: { id, userId: validToken.id },
    });

    const imagesToDelete = JSON.parse(oldProduct?.images || "[]")
      .filter((img: { id: string; url: string }) => {
        return !newImages.some(
          (newImg: { id: string; url: string }) => newImg.id === img.id
        );
      })
      .map((img: { id: string; url: string }) => img.id);

    await fetch(process.env.BASE_URL + "/cloudinary/delete-many", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${req.headers.get("token")}`,
      },
      body: JSON.stringify(imagesToDelete),
    });

    const tokenUserProduct = await prisma.product.update({
      where: { id, userId: validToken.id },
      data: {
        ...data,
      },
    });

    return NextResponse.json(
      {
        product: {
          ...tokenUserProduct,
          thumbnail: JSON.parse(
            tokenUserProduct.thumbnail || "{url: null, id: null}"
          ),
          images: JSON.parse(tokenUserProduct.images || "[]"),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return defaultError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const validToken = await validateToken(req);

    const body = await req.json();

    const tokenUser = await prisma.user.findUnique({
      where: { id: validToken.id },
    });

    if (!tokenUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id: body.productId, userId: validToken.id },
    });

    return new NextResponse(null, {
      status: 204,
    });
  } catch (error) {
    return defaultError(error);
  }
}
