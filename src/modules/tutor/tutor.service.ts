import type { Prisma, Tutor } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createTutor = async (
  data: Omit<Tutor, "id" | "createdAt" | "ratingAvg" | "userId">,
  userId: string,
) => {
  const existingTutor = await prisma.tutor.findUnique({ where: { userId } });
  if (existingTutor) {
    throw new Error("Tutor profile already exists.");
  }

  return await prisma.tutor.create({
    data: {
      ...data,
      userId,
    },
  });
};

const updateTutorProfile = async (
  userId: string,
  data: Partial<Omit<Tutor, "id" | "createdAt" | "userId">>,
) => {
  return await prisma.tutor.update({
    where: { userId },
    data,
  });
};

const getAllTutors = async (payload: {
  search: string | undefined;
  categoryId: string | undefined;
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
  isFeatured: boolean | undefined;
}) => {
  const andConditions: Prisma.TutorWhereInput[] = [];

  if (payload.search) {
    const users = await prisma.user.findMany({
      where: {
        name: {
          contains: payload.search,
          mode: "insensitive",
        },
      },
      select: { id: true },
    });

    const userIds = users.map((u) => u.id);
    andConditions.push({
      userId: { in: userIds },
    });
  }

  if (payload.categoryId) {
    andConditions.push({
      subjects: {
        some: {
          categoryId: payload.categoryId,
        },
      },
    });
  }
  if (typeof payload.isFeatured === "boolean") {
    andConditions.push({
      isFeatured: payload.isFeatured,
    });
  }
  const tutors = await prisma.tutor.findMany({
    take: payload.limit,
    skip: payload.skip,
    where: {
      AND: andConditions,
    },
    orderBy: {
      [payload.sortBy]: payload.sortOrder,
    },
    include: {
      subjects: {
        include: {
          category: true,
        },
      },
      _count: {
        select: { reviews: true, bookings: true },
      },
    },
  });

  const total = await prisma.tutor.count({
    where: { AND: andConditions },
  });

  const tutorUserIds = tutors.map((t) => t.userId);
  const userRecords = await prisma.user.findMany({
    where: { id: { in: tutorUserIds } },
    select: { id: true, name: true, image: true },
  });

  const enrichedTutors = tutors.map((tutor) => {
    const user = userRecords.find((u) => u.id === tutor.userId);
    return {
      ...tutor,
      user: user || null,
    };
  });

  return {
    tutors: enrichedTutors,
    pagination: {
      total,
      page: payload.page,
      limit: payload.limit,
      totalPages: Math.ceil(total / payload.limit),
    },
  };
};

const getTutorById = async (id: string) => {
  const tutor = await prisma.tutor.findUniqueOrThrow({
    where: { id: id },
    include: {
      subjects: { include: { category: true } },
      availability: {
        where: { isBooked: false },
        orderBy: [{ day: "asc" }, { startTime: "asc" }],
      },
      reviews: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const tutorUser = await prisma.user.findUnique({
    where: { id: tutor.userId },
    select: { id: true, name: true, email: true, image: true },
  });

  const studentIds = tutor.reviews.map((r) => r.studentId);
  const students = await prisma.user.findMany({
    where: { id: { in: studentIds } },
    select: { id: true, name: true, image: true },
  });

  const enrichedReviews = tutor.reviews.map((review) => ({
    ...review,
    student: students.find((s) => s.id === review.studentId) || null,
  }));

  return {
    ...tutor,
    user: tutorUser || null,
    reviews: enrichedReviews,
  };
};

export const tutorService = {
  createTutor,
  updateTutorProfile,
  getAllTutors,
  getTutorById,
};
