import { z } from "zod";

export const createEnquirySchema = z.object({
  customerName: z.string().min(2, "Customer name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  message: z.string().optional(),
});

export const updateEnquirySchema = z.object({
  customerName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  message: z.string().optional(),
  status: z.enum(["new", "in-progress", "closed"]).optional(),
  assignedTo: z.string().nullable().optional(),
});
