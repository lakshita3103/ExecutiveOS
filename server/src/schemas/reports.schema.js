import { z } from "zod";

// Tasks/events/notes come straight from the client's local app state, so
// we deliberately keep this loose (passthrough records) rather than
// mirroring every client-side field one-for-one.
const looseRecord = z.record(z.any());

export const reportsRequestSchema = z.object({
  tasks: z.array(looseRecord).optional().default([]),
  events: z.array(looseRecord).optional().default([]),
  notes: z.array(looseRecord).optional().default([]),
});