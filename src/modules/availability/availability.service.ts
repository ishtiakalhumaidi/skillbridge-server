import { prisma } from "../../lib/prisma";
import type { Prisma } from "../../../generated/prisma/client";

const createAvailability = async (
  userId: string,
  data: { day: string; startTime: string; endTime: string }
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
      day: data.day,
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
    where: { tutorId: tutor.id },
    orderBy: [
      { day: "asc" },
      { startTime: "asc" },
    ],
  });
};

const getTutorAvailabilityPublic = async (tutorId: string) => {
  // Students only need to see slots that haven't been booked yet
  return await prisma.availability.findMany({
    where: {
      tutorId: tutorId,
      isBooked: false, 
    },
    orderBy: [
      { day: "asc" },
      { startTime: "asc" },
    ],
  });
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
    throw new Error("Cannot delete a slot that is already booked by a student.");
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
};