import { prisma } from "../../lib/prisma";

const addSubject = async (userId: string, categoryId: string) => {
  const tutor = await prisma.tutor.findUnique({
    where: { userId },
  });

  if (!tutor) {
    throw new Error("Tutor profile not found. Please create a profile first.");
  }

  const existingSubject = await prisma.tutorSubject.findUnique({
    where: {
      tutorId_categoryId: {
        tutorId: tutor.id,
        categoryId: categoryId,
      },
    },
  });

  if (existingSubject) {
    throw new Error("You have already added this subject to your profile.");
  }

  return await prisma.tutorSubject.create({
    data: {
      tutorId: tutor.id,
      categoryId: categoryId,
    },
    include: {
      category: true, 
    },
  });
};

const removeSubject = async (userId: string, categoryId: string) => {
  const tutor = await prisma.tutor.findUnique({
    where: { userId },
  });

  if (!tutor) {
    throw new Error("Tutor profile not found.");
  }

  const existingSubject = await prisma.tutorSubject.findUnique({
    where: {
      tutorId_categoryId: {
        tutorId: tutor.id,
        categoryId: categoryId,
      },
    },
  });

  if (!existingSubject) {
    throw new Error("This subject is not attached to your profile.");
  }

  return await prisma.tutorSubject.delete({
    where: {
      tutorId_categoryId: {
        tutorId: tutor.id,
        categoryId: categoryId,
      },
    },
  });
};

export const tutorSubjectService = {
  addSubject,
  removeSubject,
};