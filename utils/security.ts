import * as jose from "jose";
import * as bcrypt from "bcrypt";
import { TokenUser } from "@/interfaces/TokenUser";

export const createEmailToken = async ({
  email,
  purpose,
}: {
  email: string;
  purpose: string;
}): Promise<string> => {
  const jwt = await new jose.SignJWT({ email, purpose })
    .setProtectedHeader({
      alg: process.env.EMAIL_TOKEN_ALGORITHM || "HS256",
    })
    .setExpirationTime(process.env.EMAIL_TOKEN_EXPIRATION_TIME || "15m")
    .sign(new TextEncoder().encode(process.env.EMAIL_TOKEN_SECRET));
  return jwt;
};

export const validateEmailToken = async (
  token: string
): Promise<{ email: string }> => {
  const { payload }: { payload: TokenUser } = await jose.jwtVerify(
    token,
    new TextEncoder().encode(process.env.EMAIL_TOKEN_SECRET)
  );
  return payload;
};

export const createJWT = async (user: {
  id: string;
  name: string;
  lastName: string;
  email: string;
}): Promise<string> => {
  const jwt = await new jose.SignJWT({
    ...user,
  })
    .setProtectedHeader({
      alg: process.env.JWT_ALGORITHM || "HS256",
    })
    .setIssuedAt()
    .setIssuer("urn:example:issuer")
    .setAudience("urn:example:audience")
    .setExpirationTime(process.env.JWT_EXPIRATION_TIME || "1h")
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));

  return jwt;
};

export const validateJWT = async (token: string): Promise<TokenUser> => {
  const { payload }: { payload: TokenUser } = await jose.jwtVerify(
    token,
    new TextEncoder().encode(process.env.JWT_SECRET),
    {
      issuer: "urn:example:issuer",
      audience: "urn:example:audience",
    }
  );
  return payload;
};

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
) => {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
};
