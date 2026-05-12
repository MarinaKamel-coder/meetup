import { z } from "zod";

export const teamSchema = z.object({
  name: z.string().min(3, "Le nom de l'équipe est requis"),
  tournamentId: z.string().cuid("ID de tournoi invalide"),
  maxCapacity: z.number().min(2, "Minimum 2 joueurs").max(50).default(15),
});