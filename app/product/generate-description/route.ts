import { defaultError } from "@/utils/defaultError";
import { validateToken } from "@/utils/tokenValidator";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    await validateToken(req);
    const { name } = await req.json();
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Invalid product name" },
        { status: 400 }
      );
    }

    const prompt = `Write a compelling product description for a product named "${name}".`;
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-nano",
      messages: [{ role: "user", content: prompt }],
      max_completion_tokens: 150,
      temperature: 0.7,
    });

    const description = response.choices[0].message.content;
    return NextResponse.json({ description }, { status: 200 });
  } catch (error) {
    return defaultError(error);
  }
}
