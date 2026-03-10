import type { NextFunction, Request, Response } from "express";
import { tutorSubjectService } from "./tutorSubject.service";

const addSubject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized!" });
    }

    const { categoryId } = req.body;

    if (!categoryId) {
      return res
        .status(400)
        .json({ success: false, message: "categoryId is required." });
    }

    const result = await tutorSubjectService.addSubject(
      req.user.id as string,
      categoryId,
    );

    res.status(201).json({
      success: true,
      message: "Subject added to your profile successfully.",
      data: result,
    });
  } catch (error: any) {
    // 💡 FIX: Safely extract the message so it never crashes
    const errMsg = error?.message || "";

    if (
      typeof errMsg === "string" &&
      (errMsg.includes("Tutor profile not found") ||
        errMsg.includes("already added"))
    ) {
      return res.status(400).json({ success: false, message: errMsg });
    }

    // Safely check for Prisma constraint errors
    if (error?.code === "P2003") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid categoryId provided." });
    }

    next(error);
  }
};

const removeSubject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized!" });
    }

    const { categoryId } = req.params;
    const categoryString =
      typeof categoryId === "string" ? categoryId : undefined;

    if (!categoryString) {
      return res
        .status(400)
        .json({ success: false, message: "categoryId is required." });
    }

    const result = await tutorSubjectService.removeSubject(
      req.user.id as string,
      categoryString,
    );

    res.status(200).json({
      success: true,
      message: "Subject removed from your profile successfully.",
      data: result,
    });
  } catch (error: any) {
    // 💡 FIX: Safely extract the message here too
    const errMsg = error?.message || "";

    if (
      typeof errMsg === "string" &&
      (errMsg.includes("Tutor profile not found") ||
        errMsg.includes("not attached"))
    ) {
      return res.status(400).json({ success: false, message: errMsg });
    }

    next(error);
  }
};

export const tutorSubjectController = {
  addSubject,
  removeSubject,
};
