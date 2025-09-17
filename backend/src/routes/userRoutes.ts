import { Router } from "express";
import { createUser, deleteUser, getUserById, getUsers, updateUser } from "../controllers/userController";
import { auth, authorize } from "../middlewares/authMiddleware";

const router = Router();

// Get All Users
router.get("/", auth, authorize("admin"), getUsers);

// Get Single User
router.get("/:id", auth, authorize("admin"), getUserById);

// Create User
router.post("/", auth, authorize("admin"), createUser);

// Update User
router.put("/:id", auth, authorize("admin"), updateUser);

// Delete User
router.delete("/:id", auth, authorize("admin"), deleteUser);

export default router;
