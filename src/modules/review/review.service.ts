import { prisma } from "../../lib/prisma";
import type { Prisma } from "../../../generated/prisma/client";

const createReview = async (
  studentId: string,
  payload: { bookingId: string; rating: number; comment?: string },
) => {
  return await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUniqueOrThrow({
      where: { id: payload.bookingId },
    });

    if (booking.studentId !== studentId) {
      throw new Error("You can only review your own bookings.");
    }

    if (booking.status !== "COMPLETED") {
      throw new Error(
        "You can only leave a review after the session is completed.",
      );
    }

    const existingReview = await tx.review.findUnique({
      where: { bookingId: payload.bookingId },
    });

    if (existingReview) {
      throw new Error("You have already reviewed this session.");
    }

    const review = await tx.review.create({
      data: {
        bookingId: payload.bookingId,
        studentId: studentId,
        tutorId: booking.tutorId,
        rating: payload.rating,
        comment: payload.comment ?? null,
      },
    });

    const aggregations = await tx.review.aggregate({
      where: { tutorId: booking.tutorId },
      _avg: {
        rating: true,
      },
    });

 
    await tx.tutor.update({
      where: { id: booking.tutorId },
      data: {
        ratingAvg: aggregations._avg.rating || payload.rating,
      },
    });

    return review;
  });
};

const getTutorReviews = async (
  tutorId: string,
  payload: { page: number; limit: number; skip: number },
) => {
  const reviews = await prisma.review.findMany({
    where: { tutorId },
    take: payload.limit,
    skip: payload.skip,
    orderBy: { createdAt: "desc" },
  });

  const total = await prisma.review.count({ where: { tutorId } });


  const studentIds = reviews.map((r) => r.studentId);
  const students = await prisma.user.findMany({
    where: { id: { in: studentIds } },
    select: { id: true, name: true, image: true },
  });

 
  const enrichedReviews = reviews.map((review) => {
    return {
      ...review,
      student: students.find((s) => s.id === review.studentId) || null,
    };
  });

  return {
    reviews: enrichedReviews,
    pagination: {
      total,
      page: payload.page,
      limit: payload.limit,
      totalPages: Math.ceil(total / payload.limit),
    },
  };
};

export const reviewService = {
  createReview,
  getTutorReviews,
};
