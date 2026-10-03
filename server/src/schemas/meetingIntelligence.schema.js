import { z } from "zod";

export const meetingIntelligenceRequestSchema = z.object({
  notes: z
    .string({ required_error: "Meeting notes are required." })
    .trim()
    .min(1, "Meeting notes are required."),
});