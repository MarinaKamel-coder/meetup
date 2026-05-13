import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '../src/app/generated/prisma/client';

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});


async function main() {
  console.log("🚀 Début du remplissage de la base de données...");

  // 1. Nettoyage 
  await prisma.joinRequest.deleteMany();
  await prisma.match.deleteMany();
  await prisma.team.deleteMany();
  await prisma.tournament.deleteMany();

  // 2. Recherche d'un organisateur (Clerk synchronisé)
  const organizer = await prisma.user.findFirst({
    where: { role: "ORGANIZER" }
  });

  if (!organizer) {
    console.warn("⚠️ Aucun organisateur trouvé. Le seed va s'arrêter.");
    console.info("💡 Connecte-toi d'abord à l'application pour créer ton compte via Clerk.");
    return;
  }

  // 3. Création du tournoi
  const tournament = await prisma.tournament.create({
    data: {
      name: "Grand Tournoi de Soccer - Rive-Sud",
      sport: "Soccer",
      city: "Longueuil",
      startDate: new Date("2026-06-20T10:00:00Z"),
      entryFee: 1500, // 15.00 $
      currency: "CAD",
      organizerId: organizer.id,
    },
  });

  // 4. Création des équipes de démonstration
  await prisma.team.createMany({
    data: [
      {
        name: "Éclairs de Longueuil",
        maxCapacity: 12,
        tournamentId: tournament.id,
      },
      {
        name: "Strikers du Sud",
        maxCapacity: 10,
        tournamentId: tournament.id,
      },
      {
        name: "Gardiens du Parc",
        maxCapacity: 15,
        tournamentId: tournament.id,
      }
    ],
  });

  console.log("✅ Seed terminé avec succès !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });