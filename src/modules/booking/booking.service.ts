import { prisma } from "../../lib/prisma";
import type { Prisma, BookingStatus } from "../../../generated/prisma/client";

const createBooking = async (
  studentId: string,
  payload: { availabilityId: string; categoryId: string; date: string }
) => {
  return await prisma.$transaction(async (tx) => {
    const slot = await tx.availability.findUniqueOrThrow({
      where: { id: payload.availabilityId },
    });

    // 2. Prevent double-booking
    if (slot.isBooked) {
      throw new Error("This time slot has already been booked by another student.");
    }
    const booking = await tx.booking.create({
      data: {
        studentId: studentId,
        tutorId: slot.tutorId,
        categoryId: payload.categoryId,
        date: new Date(payload.date), 
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: "CONFIRMED",
      },
    });


    await tx.availability.update({
      where: { id: slot.id },
      data: { isBooked: true },
    });

    return booking;
  });
};

const getMyBookings = async (userId: string) => {
  // A user might be a student, or they might be a tutor. We need to check both.
  const tutorProfile = await prisma.tutor.findUnique({
    where: { userId },
  });

  const orConditions: Prisma.BookingWhereInput[] = [{ studentId: userId }];
  
  if (tutorProfile) {
    orConditions.push({ tutorId: tutorProfile.id });
  }

  const bookings = await prisma.booking.findMany({
    where: {
      OR: orConditions,
    },
    orderBy: [
      { date: "desc" },
      { startTime: "desc" }
    ],
    include: {
      category: true,
      tutor: true, 
    },
  });


  const userIdsToFetch = new Set<string>();
  bookings.forEach((b) => {
    userIdsToFetch.add(b.studentId);
    userIdsToFetch.add(b.tutor.userId);
  });


  const users = await prisma.user.findMany({
    where: { id: { in: Array.from(userIdsToFetch) } },
    select: { id: true, name: true, email: true, image: true },
  });


  return bookings.map((booking) => {
    return {
      ...booking,
      student: users.find((u) => u.id === booking.studentId) || null,
      tutor: {
        ...booking.tutor,
        user: users.find((u) => u.id === booking.tutor.userId) || null,
      },
    };
  });
};

const updateBookingStatus = async (
  bookingId: string,
  userId: string,
  status: BookingStatus
) => {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: { tutor: true },
  });


  if (booking.studentId !== userId && booking.tutor.userId !== userId) {
    throw new Error("You are not authorized to update this booking.");
  }

  return await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
  });
};

export const bookingService = {
  createBooking,
  getMyBookings,
  updateBookingStatus,
};