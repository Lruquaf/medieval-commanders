-- Change birthDate and deathDate from DateTime to Int (year only)
-- This migration converts existing DateTime values to year integers

-- Add new columns
ALTER TABLE "cards" ADD COLUMN "birthYear" INTEGER;
ALTER TABLE "cards" ADD COLUMN "deathYear" INTEGER;
ALTER TABLE "proposals" ADD COLUMN "birthYear" INTEGER;
ALTER TABLE "proposals" ADD COLUMN "deathYear" INTEGER;

-- Convert existing DateTime values to years
-- Extract year from existing birthDate and deathDate columns
UPDATE "cards" SET "birthYear" = CAST(strftime('%Y', "birthDate") AS INTEGER) WHERE "birthDate" IS NOT NULL;
UPDATE "cards" SET "deathYear" = CAST(strftime('%Y', "deathDate") AS INTEGER) WHERE "deathDate" IS NOT NULL;
UPDATE "proposals" SET "birthYear" = CAST(strftime('%Y', "birthDate") AS INTEGER) WHERE "birthDate" IS NOT NULL;
UPDATE "proposals" SET "deathYear" = CAST(strftime('%Y', "deathDate") AS INTEGER) WHERE "deathDate" IS NOT NULL;

-- Drop old columns
ALTER TABLE "cards" DROP COLUMN "birthDate";
ALTER TABLE "cards" DROP COLUMN "deathDate";
ALTER TABLE "proposals" DROP COLUMN "birthDate";
ALTER TABLE "proposals" DROP COLUMN "deathDate";
