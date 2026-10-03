import { z } from "zod";

export const emailRequestSchema = z
  .object({
    mode: z
      .enum(["write", "rewrite", "reply", "summarize"])
      .optional()
      .default("write"),
    prompt: z.string().optional().default(""),
    email: z.string().optional().default(""),
  })
  .refine((data) => data.prompt.trim() || data.email.trim(), {
    message: "Prompt or email content is required",
  });