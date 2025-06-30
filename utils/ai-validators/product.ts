import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const validateProductWithAI = async (data: any) => {
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
};
