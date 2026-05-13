import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/app/generated/prisma/client";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding...");

  // 1. Nettoyage
  await prisma.joinRequest.deleteMany();
  await prisma.match.deleteMany();
  await prisma.team.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.playerProfile.deleteMany();
  await prisma.user.deleteMany();
  console.log("🧹 Base nettoyée");

  // 2. Users
  const organizer = await prisma.user.upsert({
    where: { clerkId: "user_3DeTH0jPvmtGpnw8iLhDSZCOiQh" },
    update: {},
    create: {
      clerkId: "user_3DeTH0jPvmtGpnw8iLhDSZCOiQh",
      email: "marina@test.com",
      fullName: "Marina Kamel",
      role: "ORGANIZER",
    },
  });

  const player = await prisma.user.upsert({
    where: { clerkId: "user_3DfJSO4NLewbAZ352GNtLgRyWMv" },
    update: {},
    create: {
      clerkId: "user_3DfJSO4NLewbAZ352GNtLgRyWMv",
      email: "sonia@test.com",
      fullName: "Sonia Corbin",
      role: "PLAYER",
    },
  });
  console.log("✅ Users créés");

  // 3. Profil joueur
  await prisma.playerProfile.upsert({
    where: { userId: player.id },
    update: {},
    create: {
      userId: player.id,
      city: "Montréal",
      favoriteSport: "Soccer",
      level: "INTERMEDIATE",
      position: "Attaquant",
    },
  });
  console.log("✅ Profil joueur créé");

  // 4. Tournois
  const tournament1 = await prisma.tournament.create({
    data: {
      name: "Grand Tournoi de Soccer - Rive-Sud",
      sport: "Soccer",
      city: "Longueuil",
      startDate: new Date("2026-06-20T10:00:00Z"),
      entryFee: 1500,
      currency: "CAD",
      organizerId: organizer.id,
    },
  });

  const tournament2 = await prisma.tournament.create({
    data: {
      name: "Coupe de Montréal 2026",
      sport: "Football",
      city: "Montréal",
      startDate: new Date("2026-07-15T10:00:00Z"),
      entryFee: 0,
      currency: "CAD",
      organizerId: organizer.id,
    },
  });
  console.log("✅ Tournois créés");

  // 5. Équipes
  const team1 = await prisma.team.create({
    data: { name: "Éclairs de Longueuil", maxCapacity: 12, tournamentId: tournament1.id },
  });

  const team2 = await prisma.team.create({
    data: { name: "Strikers du Sud", maxCapacity: 10, tournamentId: tournament1.id },
  });

  await prisma.team.create({
    data: { name: "Les Aigles", maxCapacity: 11, tournamentId: tournament2.id },
  });
  console.log("✅ Équipes créées");

  // 6. Demande d'adhésion
  await prisma.joinRequest.create({
    data: {
      playerId: player.id,
      teamId: team1.id,
      message: "Je suis motivée et disponible tous les weekends !",
      status: "PENDING",
      paymentStatus: "NOT_REQUIRED",
    },
  });
  console.log("✅ Demande créée");

  // 7. Match
  await prisma.match.create({
    data: {
      teamAId: team1.id,
      teamBId: team2.id,
      date: new Date("2026-06-25T14:00:00Z"),
      location: "Stade Saputo, Montréal",
    },
  });
  console.log("✅ Match créé");

  console.log("🎉 Seed terminé !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });