import type { NextFunction, Request, Response } from "express";
import { bookingService } from "./booking.service";
import type { BookingStatus } from "../../../generated/prisma/client";

const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized!" });
    }

    const result = await bookingService.createBooking(
      req.user.id as string,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Booking confirmed successfully.",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

const getMyBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized!" });
    }

    const result = await bookingService.getMyBookings(req.user.id as string);

    res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully.",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

const updateBookingStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized!" });
    }

    const { id } = req.params;
    const { status } = req.body; 

    const result = await bookingService.updateBookingStatus(
      id as string,
      req.user.id as string,
      status as BookingStatus
    );

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}.`,
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

export const bookingController = {
  createBooking,
  getMyBookings,
  updateBookingStatus,
};