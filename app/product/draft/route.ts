import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { JOSEError } from "jose/errors";
import { validateJWT } from "@/utils/security";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const validToken = await validateJWT(token);

    const draft = await prisma.productDraft.findUnique({
      where: { userId: validToken.id },
    });

    return NextResponse.json(
      {
        draft: {
          ...draft,
          thumbnail: JSON.parse(
            draft?.thumbnail || '{"url": null, "id": null}'
          ),
          images: JSON.parse(draft?.images || "[]"),
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

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const validToken = await validateJWT(token);

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
    console.error(error);
    if (error instanceof JOSEError) {
      return NextResponse.json(
        { error: "Expired or invalid token", code: "er1001" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Failed to save draft" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const validToken = await validateJWT(token);

    await prisma.productDraft.delete({
      where: { userId: validToken.id },
    });

    return new NextResponse(null, { status: 204 });
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
