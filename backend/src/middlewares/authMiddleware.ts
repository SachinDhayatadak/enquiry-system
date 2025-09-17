import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "defaultSecret";

export interface JwtPayload {
  id: string;
  role: "admin" | "staff";
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ error: "No token provided" });

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Role-based middleware
export const authorize =
  (...roles: ("admin" | "staff")[]) =>
    (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) return res.status(401).json({ error: "Not authenticated" });

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: "Forbidden: insufficient permissions" });
      }

      next();
    };
