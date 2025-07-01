import { prisma } from "@/lib/prisma";
import { defaultError } from "@/utils/defaultError";
import { validateToken } from "@/utils/tokenValidator";
import { cartSchema } from "@/utils/validators/cart";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const validToken = await validateToken(req);

    const userCart = await prisma.cart.findMany({
      where: {
        userId: validToken.id,
      },
      select: {
        id: true,
        quantity: true,
        productId: true,
        product: {
          select: {
            name: true,
            price: true,
            stock: true,
          },
        },
      },
    });

    const flatCart = userCart.map((item) => {
      return {
        id: item.id,
        quantity: item.quantity,
        productId: item.productId,
        name: item.product.name,
        price: item.product.price,
        stock: item.product.stock,
      };
    });

    const totalResult = await prisma.$queryRawUnsafe<
      { totalQuantity: number; totalPrice: number }[]
    >(
      `
        SELECT 
          SUM(c.quantity) AS "totalQuantity",
          SUM(c.quantity * p.price) AS "totalPrice"
        FROM "Cart" c
        JOIN "Product" p ON c."productId" = p.id
        WHERE c."userId" = $1
      `,
      validToken.id
    );

    const { totalQuantity, totalPrice } = totalResult[0] || {
      totalQuantity: 0,
      totalPrice: 0,
    };

    return NextResponse.json(
      {
        cart: flatCart,
        total: Number(totalQuantity),
        totalPrice: Number(totalPrice),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return defaultError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const validToken = await validateToken(req);
    const { productId, quantity } = await req.json();

    const validProduct = cartSchema.parse({ quantity });

    let parsedQuantity = validProduct.quantity;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (parsedQuantity > product.stock) {
      parsedQuantity = product.stock;
    }

    const newCartItem = await prisma.cart.upsert({
      where: {
        userId_productId: {
          userId: validToken.id,
          productId,
        },
      },
      update: {},
      create: {
        userId: validToken.id,
        productId,
        quantity: parsedQuantity,
      },
    });

    return NextResponse.json({ product: newCartItem }, { status: 200 });
  } catch (error) {
    return defaultError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const validToken = await validateToken(req);
    const { quantity, itemId } = await req.json();

    const newCartItem = await prisma.cart.update({
      where: {
        id: itemId,
        userId: validToken.id,
      },
      data: {
        quantity,
      },
    });

    return NextResponse.json({ product: newCartItem }, { status: 200 });
  } catch (error) {
    return defaultError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const validToken = await validateToken(req);
    const { itemId } = await req.json();

    await prisma.cart.delete({
      where: {
        id: itemId,
        userId: validToken.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return defaultError(error);
  }
}
