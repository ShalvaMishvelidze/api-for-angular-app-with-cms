import { prisma } from "@/lib/prisma";
import { productSchema } from "@/utils/validators/product";
import { JOSEError } from "jose/errors";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import OpenAI from "openai";
import { validateToken } from "@/utils/tokenValidator";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const validToken = await validateToken(req);
    console.log(validToken);

    const tokenUser = await prisma.user.findUnique({
      where: { id: validToken.id },
    });

    if (!tokenUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const {
      name,
      thumbnail,
      images,
      description,
      discount,
      price,
      stock,
      category,
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
      userId: tokenUser.id,
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

    const product = await prisma.product.create({
      data: {
        ...data,
      },
    });

    return NextResponse.json(
      {
        product: {
          ...product,
          thumbnail: JSON.parse(product.thumbnail || "{url: null, id: null}"),
          images: JSON.parse(product.images || "[]"),
        },
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
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.errors.map((err) => err.message) },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
