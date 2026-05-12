import { z } from "zod";

export const joinRequestSchema = z.object({
  teamId: z.string().cuid(),
  message: z.string().max(200, "Message trop long (max 200 car.)").optional(),
});