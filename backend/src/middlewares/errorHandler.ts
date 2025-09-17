import { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils/httpResponse";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("❌ Error:", err);

  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json(
    errorResponse(message, process.env.NODE_ENV === "development" ? err.stack : undefined)
  );
};
