-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_teamAId_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_teamBId_fkey";

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_teamAId_fkey" FOREIGN KEY ("teamAId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_teamBId_fkey" FOREIGN KEY ("teamBId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
