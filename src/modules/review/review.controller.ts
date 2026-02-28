import type { NextFunction, Request, Response } from "express";
import { reviewService } from "./review.service";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";

const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized!" });
    }

    const { bookingId, rating, comment } = req.body;

   
    if (!bookingId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: "A valid bookingId and a rating between 1 and 5 are required." 
      });
    }

    const result = await reviewService.createReview(req.user.id as string, {
      bookingId,
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

const getTutorReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tutorId } = req.params;
    const { page, limit, skip } = paginationSortingHelper(req.query);

    const result = await reviewService.getTutorReviews(tutorId as string, {
      page,
      limit,
      skip,
    });

    res.status(200).json({
      success: true,
      message: "Reviews retrieved successfully.",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

export const reviewController = {
  createReview,
  getTutorReviews,
};