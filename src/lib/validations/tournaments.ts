import { z } from "zod";

export const tournamentSchema = z.object({
  name: z.string().min(5, "Le nom du tournoi doit être explicite"),
  sport: z.string().min(2, "Le sport est requis"),
  city: z.string().min(2, "La ville est requise"),
  startDate: z.coerce.date({ message: "Date invalide ou requise" }), 
  entryFee: z.coerce.number().min(0, "Le prix ne peut pas être négatif").default(0),
  currency: z.string().length(3).default("CAD"),
});