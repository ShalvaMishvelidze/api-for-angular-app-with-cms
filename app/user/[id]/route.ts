import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { validate } from "./validate";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = req.headers.get("Authorization")?.split(" ")[1];

    const validationResult = await validate(token, id);

    if (validationResult) {
      return validationResult;
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = req.headers.get("Authorization")?.split(" ")[1];
    const { name, lastName, email } = await req.json();

    const validationResult = await validate(token, id);

    if (validationResult) {
      return validationResult;
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        lastName,
        email,
      },
    });

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = req.headers.get("Authorization")?.split(" ")[1];

    const validationResult = await validate(token, id);

    if (validationResult) {
      return validationResult;
    }

    await prisma.user.delete({
      where: { id },
    });

    return new NextResponse(null, {
      status: 204,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
