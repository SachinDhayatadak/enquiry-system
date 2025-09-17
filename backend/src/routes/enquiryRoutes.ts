import { Router } from "express";
import { auth, authorize } from "../middlewares/authMiddleware";
import {
    assignEnquiry,
    createEnquiry, deleteEnquiry, getEnquiries, getEnquiry, getEnquiryActivity, getEnquiryStats, updateEnquiry
} from "../controllers/enquiryController";

const router = Router();

// Create Enquiry
router.post("/", auth, authorize("admin", "staff"), createEnquiry);

// Get All Enquiries
router.get("/", auth, authorize("admin", "staff"), getEnquiries);

// Get Enquiry Stats
router.get("/stats", auth, authorize("admin", "staff"), getEnquiryStats);

// Assign Enquiry to Staff
router.put("/:id/assign", auth, authorize("admin", "staff"), assignEnquiry); 

// Get Enquiry Activity Log
router.get("/:id/activity", auth, authorize("admin", "staff"), getEnquiryActivity);

// Get Single Enquiry by ID
router.get("/:id", auth, authorize("admin", "staff"), getEnquiry);

// Update Enquiry
router.put("/:id", auth, authorize("admin", "staff"), updateEnquiry);

// Delete Enquiry
router.delete("/:id", auth, authorize("admin", "staff"), deleteEnquiry);

export default router;
