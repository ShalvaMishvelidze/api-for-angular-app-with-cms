import { JOSEError } from "jose/errors";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export const defaultError = async (error: unknown) => {
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
  return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
};
