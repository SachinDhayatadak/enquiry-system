import { Response } from "express";
import Enquiry from "../models/Enquiry";
import { asyncHandler } from "../middlewares/asyncHandler";
import { successResponse, errorResponse } from "../utils/httpResponse";
import { createEnquirySchema, updateEnquirySchema } from "../validators/enquiryValidator";
import { AuthRequest } from "../middlewares/authMiddleware";
import { User } from "../models/User";
import ActivityLog from "../models/ActivityLog";

// ✅ Create Enquiry
export const createEnquiry = asyncHandler(async (req: AuthRequest, res: Response) => {
  const parseResult = createEnquirySchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json(errorResponse("Validation failed", parseResult.error));
  }

  const { customerName, email, phone, message } = parseResult.data;

  const enquiry = await Enquiry.create({
    customerName,
    email,
    phone,
    message,
    status: "new",
    assignedTo: null,
    createdBy: req.user?.id,
  });

  res.status(201).json(successResponse("Enquiry created successfully", enquiry));
});


// ✅ Get All Enquiries with Filters + Pagination + Search + Sort
export const getEnquiries = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    status,
    assignedTo,
    createdBy,
    search,
    page = 1,
    limit = 10,
    sort = "desc"
  } = req.query;

  const filter: any = {};
  if (status) filter.status = status;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (createdBy) filter.createdBy = createdBy;

  // 🔎 Search by customerName or email
  if (search) {
    filter.$or = [
      { customerName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [enquiries, total] = await Promise.all([
    Enquiry.find(filter)
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: sort === "asc" ? 1 : -1 }),
    Enquiry.countDocuments(filter),
  ]);

  res.status(200).json(
    successResponse("Enquiries fetched successfully", {
      enquiries,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    })
  );
});


// ✅ Get Single Enquiry by ID
export const getEnquiry = asyncHandler(async (req: AuthRequest, res: Response) => {
  const enquiry = await Enquiry.findById(req.params.id)
    .populate("assignedTo", "name email role")  // ✅ populate staff user info
    .populate("createdBy", "name email role"); // ✅ populate creator info if needed

  if (!enquiry) {
    return res.status(404).json(errorResponse("Enquiry not found"));
  }

  return res.json(successResponse("Enquiry fetched successfully", enquiry));
});


// ✅ Update Enquiry
export const updateEnquiry = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const parseResult = updateEnquirySchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json(errorResponse("Validation failed", parseResult.error));
  }

  const enquiry = await Enquiry.findByIdAndUpdate(id, parseResult.data, {
    new: true,
    runValidators: true,
  }).populate("assignedTo", "name email");

  if (!enquiry) {
    return res.status(404).json(errorResponse("Enquiry not found"));
  }

  res.status(200).json(successResponse("Enquiry updated successfully", enquiry));
});


// ✅ Delete Enquiry
export const deleteEnquiry = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const enquiry = await Enquiry.findById(id);

  if (!enquiry) {
    return res.status(404).json(errorResponse("Enquiry not found"));
  }

  await enquiry.deleteOne();

  res.status(200).json(successResponse("Enquiry deleted successfully"));
});

// ✅ Get Enquiry Stats
export const getEnquiryStats = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const total = await Enquiry.countDocuments();
  const newCount = await Enquiry.countDocuments({ status: "new" });
  const inProgressCount = await Enquiry.countDocuments({ status: "in-progress" });
  const closedCount = await Enquiry.countDocuments({ status: "closed" });

  // ✅ Recent 5 enquiries
  const recent = await Enquiry.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("customerName email status createdAt");

  // ✅ Group by date (last 7 days)
  const last7days = await Enquiry.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json(
    successResponse("Stats fetched successfully", {
      total,
      new: newCount,
      inProgress: inProgressCount,
      closed: closedCount,
      recent,
      last7days,
    })
  );
});

// ✅ Assign Enquiry to Staff

export const assignEnquiry = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { assignedTo } = req.body as { assignedTo?: string | null };

  // allow unassign
  if (!assignedTo) {
    const enquiry = await Enquiry.findByIdAndUpdate(
      id,
      { assignedTo: null },
      { new: true }
    ).populate("assignedTo", "name email");

    if (!enquiry) return res.status(404).json(errorResponse("Enquiry not found"));

    // ✅ log unassignment
    await ActivityLog.create({
      action: "unassigned",
      enquiry: id,
      user: req.user?.id,
      details: "Unassigned",
    });

    return res.json(successResponse("Enquiry unassigned", enquiry));
  }

  // validate user
  const staff = await User.findById(assignedTo);
  if (!staff) return res.status(400).json(errorResponse("Assigned user not found"));
  if (staff.role !== "staff") {
    return res.status(400).json(errorResponse("Assigned user must be a staff member"));
  }

  const enquiry = await Enquiry.findByIdAndUpdate(
    id,
    { assignedTo },
    { new: true }
  ).populate("assignedTo", "name email");

  if (!enquiry) return res.status(404).json(errorResponse("Enquiry not found"));

  // ✅ log assignment
  await ActivityLog.create({
    action: "assigned",
    enquiry: id,
    user: req.user?.id,
    details: `Assigned to ${staff.name} (${staff.email})`,
  });

  return res.json(successResponse("Enquiry assigned successfully", enquiry));
});

// Get Activity Logs for an Enquiry
export const getEnquiryActivity = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const logs = await ActivityLog.find({ enquiry: id })
    .populate("user", "name email")
    .sort({ createdAt: -1 }); // newest first

  return res.json(successResponse("Activity logs fetched", logs));
});
