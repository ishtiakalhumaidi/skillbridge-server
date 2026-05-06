import type { ErrorRequestHandler, Request, Response, NextFunction } from "express";

export const globalErrorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("🚨 [Global Error]:", err.message || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Send a consistent JSON response to the frontend
  res.status(statusCode).json({
    success: false,
    message: message,
    errorMessages: err.errors || [],
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};