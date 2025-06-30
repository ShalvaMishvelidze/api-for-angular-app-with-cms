import { prisma } from "@/lib/prisma";
import { defaultError } from "@/utils/defaultError";
import { validateToken } from "@/utils/tokenValidator";
import { productSchema } from "@/utils/validators/product";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    const prompt = `Check the following object for any inappropriate content such as NSFW, violence, or explicit language. 

      Object:
      ${JSON.stringify(data)}

      If any inappropriate content is found, return a JSON object with:
      - "error": a message describing the issue
      - "code": "er1002"

      If there is NO inappropriate content, return ONLY an empty object: {}. Do not return any messages or keys unless inappropriate content is detected.`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-nano",
      messages: [{ role: "user", content: prompt }],
      max_completion_tokens: 150,
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    if (result.code === "er1002") {
      return NextResponse.json(result, { status: 400 });
    }

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
