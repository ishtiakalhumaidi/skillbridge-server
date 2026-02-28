import type { NextFunction, Request, Response } from "express";
import { adminService } from "./admin.service";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";

const getPlatformStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await adminService.getPlatformStats();

    res.status(200).json({
      success: true,
      message: "Platform statistics retrieved successfully.",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, role } = req.query;
    const searchString = typeof search === "string" ? search : undefined;
    const roleString = typeof role === "string" ? role : undefined;

    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(
      req.query,
    );

    const result = await adminService.getAllUsers({
      search: searchString,
      role: roleString,
      page,
      limit,
      skip,
      sortBy: sortBy === "createdAt" ? "createdAt" : sortBy,
      sortOrder,
    });

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully.",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

const updateUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "Status is required." });
    }

    if (req.user?.id === id) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You cannot change your own admin status.",
        });
    }

    const result = await adminService.updateUserStatus(
      id as string,
      status as string,
    );

    res.status(200).json({
      success: true,
      message: `User status updated to ${status} successfully.`,
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

const getAllBookings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { status } = req.query;
    const statusString = typeof status === "string" ? status : undefined;
    const { page, limit, skip } = paginationSortingHelper(req.query);

    const result = await adminService.getAllBookings({
      status: statusString,
      page,
      limit,
      skip,
    });

    res.status(200).json({
      success: true,
      message: "Platform bookings retrieved successfully.",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

export const adminController = {
  getPlatformStats,
  getAllUsers,
  updateUserStatus,
  getAllBookings,
};
