import { validateJWT } from "./security";
import { JOSEError } from "jose/errors";
import { NextRequest } from "next/server";

export const validateToken = async (req: NextRequest) => {
  const token = req.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    throw new JOSEError("Authorization token is required");
  }

  const validToken = await validateJWT(token);
  return validToken;
};
