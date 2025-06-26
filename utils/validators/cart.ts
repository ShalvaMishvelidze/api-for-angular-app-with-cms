import { z } from "zod";

export const cartSchema = z.object({
  quantity: z.number().positive().int(),
});
