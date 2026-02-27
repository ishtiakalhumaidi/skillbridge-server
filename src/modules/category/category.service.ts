import type { Prisma, Category } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createCategory = async (data: Prisma.CategoryCreateInput) => {
  const isExist = await prisma.category.findUnique({
    where: { name: data.name },
  });

  if (isExist) {
    throw new Error("Category with this name already exists.");
  }

  return await prisma.category.create({
    data,
  });
};

const getAllCategories = async (payload: {
  search: string | undefined;
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
}) => {
  const andConditions: Prisma.CategoryWhereInput[] = [];

  if (payload.search) {
    andConditions.push({
      name: {
        contains: payload.search,
        mode: "insensitive",
      },
    });
  }

  const result = await prisma.category.findMany({
    take: payload.limit,
    skip: payload.skip,
    where: {
      AND: andConditions,
    },
    orderBy: {
      [payload.sortBy]: payload.sortOrder,
    },
    include: {
      _count: {
        select: {
          tutors: true,
          bookings: true,
        },
      },
    },
  });

  const total = await prisma.category.count({
    where: {
      AND: andConditions,
    },
  });

  return {
    categories: result,
    pagination: {
      total,
      page: payload.page,
      limit: payload.limit,
      totalPages: Math.ceil(total / payload.limit),
    },
  };
};

const getCategoryById = async (id: string) => {
  return await prisma.category.findUniqueOrThrow({
    where: {
      id: id,
    },
    include: {
      _count: {
        select: {
          tutors: true,
          bookings: true,
        },
      },
    },
  });
};

const updateCategory = async (
  id: string,
  data: Prisma.CategoryUpdateInput
) => {
  return await prisma.category.update({
    where: { id },
    data,
  });
};

const deleteCategory = async (id: string) => {
  return await prisma.category.delete({
    where: { id },
  });
};

export const categoryService = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};