-- AlterTable
ALTER TABLE "Preferences" ADD COLUMN     "nearUniversity" TEXT,
ADD COLUMN     "proximityPriorities" TEXT[] DEFAULT ARRAY[]::TEXT[];
