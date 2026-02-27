import type { NextFunction, Request, Response } from "express";
import { availabilityService } from "./availability.service";

const createAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized!" });
    }

    const result = await availabilityService.createAvailability(
      req.user.id as string,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Availability slot created successfully.",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

const getMyAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized!" });
    }

    const result = await availabilityService.getMyAvailability(req.user.id as string);

    res.status(200).json({
      success: true,
      message: "Your availability retrieved successfully.",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

const getTutorAvailabilityPublic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tutorId } = req.params;
    const result = await availabilityService.getTutorAvailabilityPublic(tutorId as string);

    res.status(200).json({
      success: true,
      message: "Tutor availability retrieved successfully.",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

const deleteAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized!" });
    }

    const { id } = req.params;
    const result = await availabilityService.deleteAvailability(
      req.user.id as string,
      id as string
    );

    res.status(200).json({
      success: true,
      message: "Availability slot deleted successfully.",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

export const availabilityController = {
  createAvailability,
  getMyAvailability,
  getTutorAvailabilityPublic,
  deleteAvailability,
};