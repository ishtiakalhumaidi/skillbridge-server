/*
  Warnings:

  - You are about to drop the column `student` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `tutor` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `student` on the `Review` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "student",
DROP COLUMN "tutor";

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "student";

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
