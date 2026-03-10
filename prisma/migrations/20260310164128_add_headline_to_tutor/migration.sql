-- AlterTable
ALTER TABLE "Tutor" ADD COLUMN     "headline" TEXT;

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'STUDENT';
