import { Committee } from "./committee.model.js";
import AppError from "../../shared/utils/AppError.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  getCloudinaryFolderPath,
} from "../../shared/config/cloudinary.js";

// @desc    Create a new committee member
// @route   POST /api/committee
// @access  Private/Admin
export const createCommitteeMember = async (req, res, next) => {
  try {
    const {
      name,
      nameMarathi,
      position,
      role,
      designation,
      post,
      positionMarathi,
      roleMarathi,
      designationMarathi,
      committeeType,
      year,
      order,
      isActive,
      imageUrl: directImageUrl,
    } = req.body;

    if (!name || !name.trim()) {
      return next(new AppError("Name is required", 400));
    }

    // Support position, role, designation, or post; default to "Member"
    const memberPosition = (
      position ||
      role ||
      designation ||
      post ||
      "Member"
    ).trim();

    const memberPositionMarathi = (
      positionMarathi ||
      roleMarathi ||
      designationMarathi ||
      ""
    ).trim();

    const targetYear = year ? parseInt(year, 10) : new Date().getFullYear();

    let uploadedImageUrl = directImageUrl || "";
    let uploadedPublicId = "";
    let resourceType = "image";

    if (req.file) {
      resourceType = req.file.mimetype.startsWith("video") ? "video" : "image";
      const folderPath = getCloudinaryFolderPath("committee", targetYear);
      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        folderPath,
        resourceType
      );
      uploadedImageUrl = uploadResult.secure_url;
      uploadedPublicId = uploadResult.public_id;
    }

    if (!uploadedImageUrl) {
      return next(new AppError("Member image file is required", 400));
    }

    const member = await Committee.create({
      name: name.trim(),
      nameMarathi: nameMarathi ? nameMarathi.trim() : "",
      position: memberPosition,
      role: memberPosition,
      positionMarathi: memberPositionMarathi,
      roleMarathi: memberPositionMarathi,
      imageUrl: uploadedImageUrl,
      publicId: uploadedPublicId,
      resourceType,
      committeeType: committeeType || "register",
      year: targetYear,
      order: order !== undefined ? parseInt(order, 10) : 0,
      isActive: isActive === "false" || isActive === false ? false : true,
    });

    res.status(201).json({
      success: true,
      status: "success",
      message: "Committee member created successfully",
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all committee members with optional filters
// @route   GET /api/committee
// @access  Public
export const getCommitteeMembers = async (req, res, next) => {
  try {
    const {
      committeeType,
      year,
      isActive,
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};

    if (committeeType) query.committeeType = committeeType;
    if (year) query.year = parseInt(year, 10);
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Committee.countDocuments(query);
    const members = await Committee.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      status: "success",
      count: members.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active committee members (for frontend display)
// @route   GET /api/committee/active
// @access  Public
export const getActiveCommitteeMembers = async (req, res, next) => {
  try {
    const { committeeType, year } = req.query;

    const query = { isActive: true };
    if (committeeType) query.committeeType = committeeType;
    if (year) query.year = parseInt(year, 10);

    const members = await Committee.find(query).sort({
      order: 1,
      createdAt: -1,
    });

    res.json({
      success: true,
      status: "success",
      count: members.length,
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available committee years
// @route   GET /api/committee/years
// @access  Public
export const getCommitteeYears = async (req, res, next) => {
  try {
    const years = await Committee.distinct("year");
    const currentYear = new Date().getFullYear();
    const allYears = new Set([...years.filter(Boolean), currentYear, currentYear + 1]);
    const sortedYears = Array.from(allYears).sort((a, b) => b - a);

    res.json({
      success: true,
      status: "success",
      data: sortedYears,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all committee members for admin (includes inactive)
// @route   GET /api/committee/admin/all
// @access  Private/Admin
export const getCommitteeMembersAdmin = async (req, res, next) => {
  try {
    const { committeeType, year } = req.query;
    const query = {};
    if (committeeType) query.committeeType = committeeType;
    if (year) query.year = parseInt(year, 10);

    const members = await Committee.find(query).sort({ order: 1, createdAt: -1 });

    res.json({
      success: true,
      status: "success",
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single committee member by ID
// @route   GET /api/committee/:id
// @access  Public
export const getCommitteeMemberById = async (req, res, next) => {
  try {
    const member = await Committee.findById(req.params.id);

    if (!member) {
      return next(new AppError("Committee member not found", 404));
    }

    res.json({
      success: true,
      status: "success",
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a committee member
// @route   PUT /api/committee/:id
// @access  Private/Admin
export const updateCommitteeMember = async (req, res, next) => {
  try {
    const {
      name,
      nameMarathi,
      position,
      role,
      designation,
      post,
      positionMarathi,
      roleMarathi,
      designationMarathi,
      committeeType,
      year,
      order,
      isActive,
      imageUrl: directImageUrl,
    } = req.body;

    const member = await Committee.findById(req.params.id);
    if (!member) {
      return next(new AppError("Committee member not found", 404));
    }

    // Update text & config fields
    if (name !== undefined) member.name = name.trim();
    if (nameMarathi !== undefined) member.nameMarathi = nameMarathi.trim();

    const updatedPos = position || role || designation || post;
    if (updatedPos !== undefined) {
      member.position = updatedPos.trim();
      member.role = updatedPos.trim();
    }

    const updatedPosMr = positionMarathi || roleMarathi || designationMarathi;
    if (updatedPosMr !== undefined) {
      member.positionMarathi = updatedPosMr.trim();
      member.roleMarathi = updatedPosMr.trim();
    }

    if (committeeType !== undefined) member.committeeType = committeeType;
    if (order !== undefined) member.order = parseInt(order, 10);
    if (year !== undefined) member.year = parseInt(year, 10);
    if (isActive !== undefined)
      member.isActive = isActive === "true" || isActive === true;

    // Replace image if a new one is uploaded
    if (req.file) {
      // Delete old asset from Cloudinary
      if (member.publicId) {
        await deleteFromCloudinary(
          member.publicId,
          member.resourceType || "image"
        );
      }

      const targetYear = year ? parseInt(year, 10) : member.year;
      const resourceType = req.file.mimetype.startsWith("video")
        ? "video"
        : "image";
      const folderPath = getCloudinaryFolderPath("committee", targetYear);

      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        folderPath,
        resourceType
      );

      member.imageUrl = uploadResult.secure_url;
      member.publicId = uploadResult.public_id;
      member.resourceType = resourceType;
    } else if (directImageUrl) {
      member.imageUrl = directImageUrl;
    }

    const updatedMember = await member.save();

    res.json({
      success: true,
      status: "success",
      message: "Committee member updated successfully",
      data: updatedMember,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reorder committee members (bulk update of order field)
// @route   PATCH /api/committee/reorder
// @access  Private/Admin
export const reorderCommitteeMembers = async (req, res, next) => {
  try {
    const { members } = req.body;

    if (!Array.isArray(members) || members.length === 0) {
      return next(
        new AppError(
          "An array of members with id and order is required",
          400
        )
      );
    }

    const updateOps = members.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order: parseInt(order, 10) } },
      },
    }));

    await Committee.bulkWrite(updateOps);

    res.json({
      success: true,
      status: "success",
      message: "Committee members reordered successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a committee member
// @route   DELETE /api/committee/:id
// @access  Private/Admin
export const deleteCommitteeMember = async (req, res, next) => {
  try {
    const member = await Committee.findById(req.params.id);

    if (!member) {
      return next(new AppError("Committee member not found", 404));
    }

    // Delete image from Cloudinary
    if (member.publicId) {
      await deleteFromCloudinary(
        member.publicId,
        member.resourceType || "image"
      );
    }

    await member.deleteOne();

    res.json({
      success: true,
      status: "success",
      message: "Committee member deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
