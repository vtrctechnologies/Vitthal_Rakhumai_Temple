import CommitteeMember from "../models/CommitteeMember.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { deleteFile, VALID_COMMITTEE_TYPES } from "../utils/helpers.js";

// @desc    Get all committee members (public)
// @route   GET /api/committee
// @access  Public
export const getCommitteeMembers = asyncHandler(async (req, res, next) => {
  const { committeeType } = req.query;

  const query = { isActive: true };

  if (committeeType) {
    query.committeeType = committeeType;
  }

  const members = await CommitteeMember.find(query)
    .sort({ order: 1, createdAt: 1 }) // Sort by order, then by creation date
    .populate("createdBy", "username email")
    .select("-__v");

  res.json({
    status: "success",
    count: members.length,
    data: members,
  });
});

// @desc    Get single committee member by ID (public)
// @route   GET /api/committee/:id
// @access  Public
export const getCommitteeMember = asyncHandler(async (req, res, next) => {
  const member = await CommitteeMember.findById(req.params.id)
    .populate("createdBy", "username email")
    .select("-__v");

  if (!member) {
    return next(new AppError("Committee member not found", 404));
  }

  res.json({
    status: "success",
    data: member,
  });
});

// @desc    Create new committee member
// @route   POST /api/committee
// @access  Protected (Admin only)
export const createCommitteeMember = asyncHandler(async (req, res, next) => {
  const { name, role, committeeType, order } = req.body;

  // 1. Validation
  if (!name || !role || !committeeType) {
    if (req.file) deleteFile("committee", req.file.filename);
    return next(
      new AppError("Please provide name, role, and committeeType", 400)
    );
  }

  if (!VALID_COMMITTEE_TYPES.includes(committeeType)) {
    if (req.file) deleteFile("committee", req.file.filename);
    return next(
      new AppError(
        `committeeType must be either: ${VALID_COMMITTEE_TYPES.join(", ")}`,
        400
      )
    );
  }

  try {
    // 2. Create Member
    const member = await CommitteeMember.create({
      name,
      role,
      committeeType,
      image: req.file ? req.file.filename : "",
      imageUrl: req.file ? `/uploads/committee/${req.file.filename}` : "",
      order: order || 0,
      createdBy: req.admin._id,
    });

    const populatedMember = await CommitteeMember.findById(member._id)
      .populate("createdBy", "username email")
      .select("-__v");

    res.status(201).json({
      status: "success",
      message: "Committee member created successfully",
      data: populatedMember,
    });
  } catch (error) {
    // Cleanup file if DB creation fails
    if (req.file) deleteFile("committee", req.file.filename);
    throw error;
  }
});

// @desc    Update committee member
// @route   PUT /api/committee/:id
// @access  Protected (Admin only)
export const updateCommitteeMember = asyncHandler(async (req, res, next) => {
  const { name, role, committeeType, order, isActive } = req.body;

  const member = await CommitteeMember.findById(req.params.id);

  if (!member) {
    if (req.file) deleteFile("committee", req.file.filename);
    return next(new AppError("Committee member not found", 404));
  }

  // Validate committeeType if being updated
  if (committeeType && !VALID_COMMITTEE_TYPES.includes(committeeType)) {
    if (req.file) deleteFile("committee", req.file.filename);
    return next(
      new AppError(
        `committeeType must be either: ${VALID_COMMITTEE_TYPES.join(", ")}`,
        400
      )
    );
  }

  // Handle Image Update
  if (req.file) {
    // Delete old image
    deleteFile("committee", member.image);
    // Set new image
    member.image = req.file.filename;
    member.imageUrl = `/uploads/committee/${req.file.filename}`;
  }

  // Update Fields
  if (name) member.name = name;
  if (role) member.role = role;
  if (committeeType) member.committeeType = committeeType;
  if (order !== undefined) member.order = order;
  if (isActive !== undefined) member.isActive = isActive;

  await member.save();

  const updatedMember = await CommitteeMember.findById(member._id)
    .populate("createdBy", "username email")
    .select("-__v");

  res.json({
    status: "success",
    message: "Committee member updated successfully",
    data: updatedMember,
  });
});

// @desc    Delete committee member
// @route   DELETE /api/committee/:id
// @access  Protected (Admin only)
export const deleteCommitteeMember = asyncHandler(async (req, res, next) => {
  const member = await CommitteeMember.findById(req.params.id);

  if (!member) {
    return next(new AppError("Committee member not found", 404));
  }

  // Delete associated image file
  deleteFile(member.image);

  await CommitteeMember.findByIdAndDelete(req.params.id);

  res.json({
    status: "success",
    message: "Committee member deleted successfully",
  });
});

export default {
  getCommitteeMembers,
  getCommitteeMember,
  createCommitteeMember,
  updateCommitteeMember,
  deleteCommitteeMember,
};
