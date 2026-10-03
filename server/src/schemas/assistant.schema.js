import { z } from "zod";

const messageSchema = z.object({
  role: z.string().optional().default("user"),
  content: z.union([z.string(), z.number(), z.null()]).optional().default(""),
});

export const assistantRequestSchema = z.object({
  messages: z.array(messageSchema).optional().default([]),
  context: z.string().optional().default(""),
});