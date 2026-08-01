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

    const existingBooking = await tx.booking.findFirst({
      where: {
        tutorId: slot.tutorId,
        date: new Date(payload.date),
        startTime: slot.startTime,
      }
    });

    if (existingBooking) {
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
        status: "PENDING", 
      },
    });


    return booking;
  });
};

const getMyBookings = async (
  userId: string, 
  payload: { status?: string; page: number; limit: number; skip: number }
) => {
  const tutorProfile = await prisma.tutor.findUnique({
    where: { userId },
  });

  const orConditions: Prisma.BookingWhereInput[] = [{ studentId: userId }];
  if (tutorProfile) {
    orConditions.push({ tutorId: tutorProfile.id });
  }

  // 👉 1. Calculate the cutoff date (7 days ago at midnight)
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 7);
  cutoffDate.setHours(0, 0, 0, 0);

  // 👉 2. Add the cutoff date to the query
  const whereCondition: Prisma.BookingWhereInput = {
    OR: orConditions,
    date: { gte: cutoffDate }, // 🛑 The database will automatically drop anything older than 7 days!
    ...(payload.status ? { status: payload.status as BookingStatus } : {}),
  };

  const bookings = await prisma.booking.findMany({
    where: whereCondition,
    take: payload.limit, 
    skip: payload.skip,  
    orderBy: [{ date: "desc" }, { startTime: "desc" }],
    include: {
      category: true,
      tutor: true,
    },
  });

  const total = await prisma.booking.count({ where: whereCondition });

  const userIdsToFetch = new Set<string>();
  bookings.forEach((b) => {
    userIdsToFetch.add(b.studentId);
    userIdsToFetch.add(b.tutor.userId);
  });

  const users = await prisma.user.findMany({
    where: { id: { in: Array.from(userIdsToFetch) } },
    select: { id: true, name: true, email: true, image: true },
  });

  const enrichedBookings = bookings.map((booking) => {
    return {
      ...booking,
      student: users.find((u) => u.id === booking.studentId) || null,
      tutor: {
        ...booking.tutor,
        user: users.find((u) => u.id === booking.tutor.userId) || null,
      },
    };
  });

  return {
    bookings: enrichedBookings,
    pagination: {
      total,
      page: payload.page,
      limit: payload.limit,
      totalPages: Math.ceil(total / payload.limit),
    },
  };
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
const updateMeetingLink = async (
  bookingId: string,
  userId: string,
  meetingLink: string
) => {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: { tutor: true },
  });

  // Ensure the person making the request is actually the tutor for this booking
  if (booking.tutor.userId !== userId) {
    throw new Error("You are not authorized to add a link to this booking.");
  }

  // Ensure it is paid
  if (booking.status !== "CONFIRMED" || booking.paymentStatus !== "PAID") {
    throw new Error("You can only add a meeting link after the student has paid.");
  }

  return await prisma.booking.update({
    where: { id: bookingId },
    data: { meetingLink },
  });
};

export const bookingService = {
  createBooking,
  getMyBookings,
  updateBookingStatus,
  updateMeetingLink
};