import { Response } from "express";
import { User } from "../models/User";
import { asyncHandler } from "../middlewares/asyncHandler";
import { successResponse, errorResponse } from "../utils/httpResponse";
import { createUserSchema, updateUserSchema } from "../validators/userValidator";
import { AuthRequest } from "../middlewares/authMiddleware";
import bcrypt from "bcryptjs";

// ✅ Get All Users (Admin only)
export const getUsers = asyncHandler(async (req, res) => {
  const { search, role, sort = "createdAt", order = "desc", page = 1, limit = 10 } = req.query;

  const query: any = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (role) {
    query.role = role;
  }

  const pageNumber = parseInt(page as string, 10);
  const pageSize = parseInt(limit as string, 10);

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .sort({ [sort as string]: order === "asc" ? 1 : -1 })
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .select("-passwordHash");

  res.json(
    successResponse("Users fetched", {
      users,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
      },
    })
  );
});


// ✅ Create User (Admin only)
export const createUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const parseResult = createUserSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json(errorResponse("Validation failed", parseResult.error));
    }

    const { name, email, password, role } = parseResult.data;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json(errorResponse("Email already in use"));
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, passwordHash, role });

    res.status(201).json(successResponse("User created successfully", {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    }));
});


// ✅ Update User (Admin only)
export const updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const parseResult = updateUserSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json(errorResponse("Validation failed", parseResult.error));
    }

    const { name, email, password, role } = parseResult.data;

    const user = await User.findById(id);
    if (!user) {
        return res.status(404).json(errorResponse("User not found"));
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;

    // If password provided, hash again
    if (password) {
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.status(200).json(
        successResponse("User updated successfully", {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        })
    );
});


// ✅ Delete User (Admin only)
export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json(errorResponse("User not found"));
  }

  await user.deleteOne();

  res.status(200).json(successResponse("User deleted successfully"));
});


// ✅ Get Single User by ID (Admin only)
export const getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const user = await User.findById(id).select("-passwordHash");
  if (!user) {
    return res.status(404).json(errorResponse("User not found"));
  }

  res.status(200).json(successResponse("User fetched successfully", user));
});
