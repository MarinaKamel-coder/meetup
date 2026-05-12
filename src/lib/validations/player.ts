import { z } from "zod";

export const playerProfileSchema = z.object({
  fullName: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  city: z.string().min(2, "La ville est requise"),
  favoriteSport: z.string().min(2, "Le sport est requis"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  position: z.string().optional(),
});