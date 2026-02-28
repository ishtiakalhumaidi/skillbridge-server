import { prisma } from "../../lib/prisma";
import type { Prisma } from "../../../generated/prisma/client";

const getPlatformStats = async () => {
  return await prisma.$transaction(async (tx) => {
    const [
      totalUsers,
      totalTutors,
      totalCategories,
      totalBookings,
      completedBookings,
      totalReviews,
    ] = await Promise.all([
      tx.user.count(),
      tx.tutor.count(),
      tx.category.count(),
      tx.booking.count(),
      tx.booking.count({ where: { status: "COMPLETED" } }),
      tx.review.count(),
    ]);

    return {
      users: totalUsers,
      tutors: totalTutors,
      categories: totalCategories,
      bookings: {
        total: totalBookings,
        completed: completedBookings,
      },
      reviews: totalReviews,
    };
  });
};

const getAllUsers = async (payload: {
  search: string | undefined;
  role: string | undefined;
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
}) => {
  const andConditions: Prisma.UserWhereInput[] = [];

  if (payload.search) {
    andConditions.push({
      OR: [
        { name: { contains: payload.search, mode: "insensitive" } },
        { email: { contains: payload.search, mode: "insensitive" } },
      ],
    });
  }

  if (payload.role) {
    andConditions.push({ role: payload.role });
  }

  const result = await prisma.user.findMany({
    take: payload.limit,
    skip: payload.skip,
    where: { AND: andConditions },
    orderBy: { [payload.sortBy]: payload.sortOrder },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  const total = await prisma.user.count({ where: { AND: andConditions } });

  return {
    users: result,
    pagination: {
      total,
      page: payload.page,
      limit: payload.limit,
      totalPages: Math.ceil(total / payload.limit),
    },
  };
};

const updateUserStatus = async (id: string, status: string) => {

  return await prisma.user.update({
    where: { id },
    data: { status },
    select: { id: true, name: true, email: true, status: true },
  });
};

const getAllBookings = async (payload: {
  page: number;
  limit: number;
  skip: number;
  status: string | undefined;
}) => {
  const whereCondition: Prisma.BookingWhereInput = payload.status
    ? { status: payload.status as any }
    : {};

  const bookings = await prisma.booking.findMany({
    take: payload.limit,
    skip: payload.skip,
    where: whereCondition,
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      tutor: true,
    },
  });

  const total = await prisma.booking.count({ where: whereCondition });

  const userIds = new Set<string>();
  bookings.forEach((b) => {
    userIds.add(b.studentId);
    userIds.add(b.tutor.userId);
  });

  const users = await prisma.user.findMany({
    where: { id: { in: Array.from(userIds) } },
    select: { id: true, name: true, email: true, image: true },
  });

  const enrichedBookings = bookings.map((booking) => ({
    ...booking,
    student: users.find((u) => u.id === booking.studentId) || null,
    tutor: {
      ...booking.tutor,
      user: users.find((u) => u.id === booking.tutor.userId) || null,
    },
  }));

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

export const adminService = {
  getPlatformStats,
  getAllUsers,
  updateUserStatus,
  getAllBookings,
};