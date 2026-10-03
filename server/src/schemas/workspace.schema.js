import { z } from "zod";

// Deliberately loose (see the comment in models/Workspace.js) — this is a
// per-user save slot for whatever shape the client's AppContext currently
// keeps, not a place to enforce business rules about task/event fields.
export const workspaceSchema = z.object({
  theme: z.enum(["light", "dark"]).optional(),
  focusTaskId: z.any().optional(),
  assistantMessages: z.array(z.any()).optional(),
  tasks: z.array(z.any()).optional(),
  events: z.array(z.any()).optional(),
  notes: z.array(z.any()).optional(),
  documents: z.array(z.any()).optional(),
  transactions: z.array(z.any()).optional(),
});