import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().optional(),
  discount: z.number().min(0).max(100).default(0).optional(),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  category: z.string().trim().min(1).max(50),
  status: z.enum(["active", "inactive", "suspended", "deleted"]).optional(),
  userId: z.string().cuid(),
});
