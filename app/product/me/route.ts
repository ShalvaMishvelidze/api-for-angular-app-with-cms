import { prisma } from "@/lib/prisma";
import { validateJWT } from "@/utils/security";
import { JOSEError } from "jose/errors";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const rawSearch = searchParams.get("search")?.trim() || "";
    const search = rawSearch.length > 100 ? rawSearch.slice(0, 100) : rawSearch;

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
    if (error instanceof JOSEError) {
      return NextResponse.json(
        { error: "Expired or invalid token", code: "er1001" },
        { status: 401 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
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

    const tokenUserProduct = await prisma.product.update({
      where: { id, userId: validToken.id },
      data: {
        name,
        thumbnail,
        images,
        description,
        discount,
        price,
        stock,
        category,
        status,
      },
    });

    return NextResponse.json(
      {
        product: tokenUserProduct,
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

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    const body = await req.json();

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

    await prisma.product.delete({
      where: { id: body.productId, userId: validToken.id },
    });

    return new NextResponse(null, {
      status: 204,
    });
  } catch (error) {
    if (error instanceof JOSEError) {
      return NextResponse.json(
        { error: "Expired or invalid token", code: "er1001" },
        { status: 401 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
