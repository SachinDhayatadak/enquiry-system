import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { registerSchema, loginSchema, RegisterInput, LoginInput } from "../validators/authSchemas";
import { successResponse, errorResponse } from "../utils/httpResponse";
import { asyncHandler } from "../middlewares/asyncHandler";
import { AuthRequest } from "../middlewares/authMiddleware";

const JWT_SECRET = process.env.JWT_SECRET || "defaultSecret";

// Register User
export const register = asyncHandler(async (req: Request, res: Response) => {
  try {
    const data: RegisterInput = registerSchema.parse(req.body);

    const existing = await User.findOne({ email: data.email });
    if (existing) {
      return res.status(400).json(errorResponse("Email already registered"));
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await User.create({ name: data.name, email: data.email, passwordHash });

    return res.status(201).json(
      successResponse("User registered", {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      })
    );
  } catch (err: any) {
    if (err.errors) {
      return res.status(400).json(errorResponse("Validation failed", err.errors));
    }
    return res.status(500).json(errorResponse("Registration failed", err.message));
  }
});

// Login User
export const login = asyncHandler(async (req: Request, res: Response) => {
  try {
    const data: LoginInput = loginSchema.parse(req.body);

    const user = await User.findOne({ email: data.email });
    if (!user) {
      return res.status(400).json(errorResponse("Invalid credentials"));
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      return res.status(400).json(errorResponse("Invalid credentials"));
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

    return res.json(
      successResponse("Login successful", {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      })
    );
  } catch (err: any) {
    if (err.errors) {
      return res.status(400).json(errorResponse("Validation failed", err.errors));
    }
    return res.status(500).json(errorResponse("Login failed", err.message));
  }
});

// ✅ Get Current User with full profile
export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json(errorResponse("Unauthorized"));
  }

  const user = await User.findById(req.user.id).select("-passwordHash");
  if (!user) {
    return res.status(404).json(errorResponse("User not found"));
  }

  return res.json(successResponse("User fetched", user));
});
