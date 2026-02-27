import type { NextFunction, Request, Response } from "express";
import { tutorService } from "./tutor.service";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";

const createTutor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized!" });
    }

    const result = await tutorService.createTutor(
      req.body,
      req.user.id as string,
    );

    res.status(201).json({
      success: true,
      message: "Tutor profile created successfully.",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized!" });
    }

    const result = await tutorService.updateTutorProfile(
      req.user.id as string,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Tutor profile updated successfully.",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

const getAllTutors = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { search, categoryId } = req.query;
    const searchString = typeof search === "string" ? search : undefined;
    const categoryString =
      typeof categoryId === "string" ? categoryId : undefined;
    const isFeatured = req.query.isFeatured
      ? req.query.isFeatured === "true"
      : undefined;

    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(
      req.query,
    );

    const result = await tutorService.getAllTutors({
      search: searchString,
      categoryId: categoryString,
      isFeatured,
      page,
      limit,
      skip,
      sortBy,
      sortOrder,
    });

    res.status(200).json({
      success: true,
      message: "Tutors retrieved successfully.",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

const getTutorById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const result = await tutorService.getTutorById(id as string);

    res.status(200).json({
      success: true,
      message: "Tutor retrieved successfully.",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

export const tutorController = {
  createTutor,
  updateProfile,
  getAllTutors,
  getTutorById,
};
