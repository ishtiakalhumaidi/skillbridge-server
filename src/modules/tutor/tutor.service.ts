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
  return await prisma.tutor.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      hourlyRate: 0, 
      ...data,
    },
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
        where: { date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
      },
      bookings: {
        where: { date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } }
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
const getTutorAnalytics = async (userId: string) => {
  const tutor = await prisma.tutor.findUniqueOrThrow({ where: { userId } });

  // 1. Calculate the start date (12 months ago, from the 1st of that month)
  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  // 2. Fetch only completed & paid bookings from the last 12 months
  const bookings = await prisma.booking.findMany({
    where: {
      tutorId: tutor.id,
      status: "COMPLETED",
      paymentStatus: "PAID",
      date: { gte: twelveMonthsAgo }
    },
    select: {
      date: true,
      pricePaid: true,
    }
  });

  // 3. Build the 12-month skeleton array
  const monthlyData:any[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyData.push({
      name: d.toLocaleString('en-US', { month: 'short' }), // e.g., "Jan", "Feb"
      year: d.getFullYear(),
      revenue: 0,
      sessions: 0
    });
  }

  // 4. Fill the skeleton with actual database data
  bookings.forEach((b) => {
    const bMonth = b.date.toLocaleString('en-US', { month: 'short' });
    const bYear = b.date.getFullYear();
    
    const bucket = monthlyData.find(m => m.name === bMonth && m.year === bYear);
    if (bucket) {
      bucket.sessions += 1;
      bucket.revenue += (b.pricePaid || 0);
    }
  });

  return monthlyData;
};
export const tutorService = {
  createTutor,
  updateTutorProfile,
  getAllTutors,
  getTutorById,
  getTutorAnalytics,
};
