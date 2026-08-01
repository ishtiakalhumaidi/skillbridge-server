import { prisma } from "../../lib/prisma";
import type { Prisma } from "../../../generated/prisma/client";

const createAvailability = async (
  userId: string,
  data: { day: string; startTime: string; endTime: string },
) => {
  // 1. Find the actual Tutor profile using the Better Auth userId
  const tutor = await prisma.tutor.findUnique({
    where: { userId },
  });

  if (!tutor) {
    throw new Error("Tutor profile not found. Please create a profile first.");
  }

  // 2. Create the availability slot linked to the tutorId
  return await prisma.availability.create({
    data: {
      tutorId: tutor.id,
      date: new Date(data.day),
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
    },
  });
};

const getMyAvailability = async (userId: string) => {
  const tutor = await prisma.tutor.findUniqueOrThrow({
    where: { userId },
  });

  return await prisma.availability.findMany({
    where: {
      tutorId: tutor.id,

      date: { gte: new Date(new Date().setDate(new Date().getDate() - 1)) },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
};

const getTutorAvailabilityPublic = async (tutorId: string) => {
  return await prisma.availability.findMany({
    where: {
      tutorId: tutorId,
      date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
};
const createBulkAvailability = async (
  userId: string,
  dates: string[],
  startTime: string,
  endTime: string,
) => {
  const tutor = await prisma.tutor.findUniqueOrThrow({ where: { userId } });

  const data = dates.map((dateStr) => {
    const start = new Date(`1970-01-01T${startTime}:00Z`);
    const end = new Date(`1970-01-01T${endTime}:00Z`);

    return {
      tutorId: tutor.id,
      date: new Date(dateStr),
      startTime: start,
      endTime: end,
    };
  });

  const result = await prisma.availability.createMany({
    data,
    skipDuplicates: true,
  });

  return result;
};
const deleteAvailability = async (userId: string, availabilityId: string) => {
  const tutor = await prisma.tutor.findUniqueOrThrow({
    where: { userId },
  });

  // Ensure the tutor actually owns this availability slot before deleting
  const slot = await prisma.availability.findUniqueOrThrow({
    where: { id: availabilityId },
  });

  if (slot.tutorId !== tutor.id) {
    throw new Error("You are not authorized to delete this time slot.");
  }

  if (slot.isBooked) {
    throw new Error(
      "Cannot delete a slot that is already booked by a student.",
    );
  }

  return await prisma.availability.delete({
    where: { id: availabilityId },
  });
};

export const availabilityService = {
  createAvailability,
  getMyAvailability,
  getTutorAvailabilityPublic,
  deleteAvailability,
  createBulkAvailability,
};
