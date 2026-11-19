import TopDonor from "./topDonor.model.js";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import AppError from "../../shared/utils/AppError.js";

// @desc    Get active top donors for homepage scrolling ticker
// @route   GET /api/donations/top-donors
// @access  Public
export const getActiveTopDonors = asyncHandler(async (req, res) => {
  const donors = await TopDonor.find({ isActive: true })
    .sort({ order: 1, createdAt: -1 })
    .lean();

  res.json({
    status: "success",
    data: donors,
  });
});

// @desc    Get all top donors for admin
// @route   GET /api/donations/top-donors/admin
// @access  Private/Admin
export const getAdminTopDonors = asyncHandler(async (req, res) => {
  const donors = await TopDonor.find({})
    .sort({ order: 1, createdAt: -1 })
    .lean();

  res.json({
    status: "success",
    data: donors,
  });
});

// @desc    Add top donor for homepage ticker
// @route   POST /api/donations/top-donors
// @access  Private/Admin
export const createTopDonor = asyncHandler(async (req, res, next) => {
  const { name, marathiName, tag, amount, order, isActive } = req.body;

  if (!name || !name.trim()) {
    return next(new AppError("Donor name is required", 400));
  }

  const donor = await TopDonor.create({
    name: name.trim(),
    marathiName: (marathiName || "").trim(),
    tag: (tag || "दानशूर").trim(),
    amount: Number(amount) || 0,
    order: Number(order) || 0,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
  });

  res.status(201).json({
    status: "success",
    message: "Top donor added successfully",
    data: donor,
  });
});

// @desc    Update top donor
// @route   PUT /api/donations/top-donors/:id
// @access  Private/Admin
export const updateTopDonor = asyncHandler(async (req, res, next) => {
  const { name, marathiName, tag, amount, order, isActive } = req.body;

  const donor = await TopDonor.findById(req.params.id);
  if (!donor) {
    return next(new AppError("Top donor not found", 404));
  }

  if (name !== undefined) {
    if (!name.trim()) {
      return next(new AppError("Donor name cannot be empty", 400));
    }
    donor.name = name.trim();
  }
  if (marathiName !== undefined) donor.marathiName = marathiName.trim();
  if (tag !== undefined) donor.tag = tag.trim() || "दानशूर";
  if (amount !== undefined) donor.amount = Number(amount) || 0;
  if (order !== undefined) donor.order = Number(order) || 0;
  if (isActive !== undefined) donor.isActive = Boolean(isActive);

  await donor.save();

  res.json({
    status: "success",
    message: "Top donor updated successfully",
    data: donor,
  });
});

// @desc    Delete top donor
// @route   DELETE /api/donations/top-donors/:id
// @access  Private/Admin
export const deleteTopDonor = asyncHandler(async (req, res, next) => {
  const donor = await TopDonor.findByIdAndDelete(req.params.id);
  if (!donor) {
    return next(new AppError("Top donor not found", 404));
  }

  res.json({
    status: "success",
    message: "Top donor deleted successfully",
  });
});
