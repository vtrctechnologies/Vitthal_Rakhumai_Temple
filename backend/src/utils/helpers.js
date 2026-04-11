import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import GalleryCategory from "../models/GalleryCategory.js"; // Required for resolveCategory

/**
 * ------------------------------------------------------------------
 * CONSTANTS
 * ------------------------------------------------------------------
 */
export const VALID_COMMITTEE_TYPES = ["register", "utsav", "mahila"];
export const VALID_POSITIONS = ["first", "second", "third"];

/**
 * ------------------------------------------------------------------
 * FILE SYSTEM HELPERS
 * ------------------------------------------------------------------
 */

/**
 * Safely deletes a file from the uploads directory.
 */
export const deleteFile = (folder, filename) => {
  if (!filename) return;

  // Construct path: ProjectRoot/uploads/folder/filename
  const filePath = path.join(process.cwd(), "uploads", folder, filename);

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
  }
};

/**
 * ------------------------------------------------------------------
 * STRING & LOGIC HELPERS
 * ------------------------------------------------------------------
 */

/**
 * Generates a URL-friendly slug from a string.
 */
export const generateSlug = (name) => {
  if (!name) return "";
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric chars with hyphens
    .replace(/(^-|-$)/g, ""); // Remove leading/trailing hyphens
};

/**
 * Processes team members array, normalizing data and handling captain flag.
 * Used in SportWinner controller.
 */
export const processTeamMembers = (membersInput, captainName) => {
  const processedMembers = [];
  const normalizedCaptain = captainName ? captainName.trim() : "";

  if (membersInput && Array.isArray(membersInput)) {
    membersInput.forEach((member) => {
      let name = "";
      // Handle if member is passed as just a string or an object
      if (typeof member === "string") {
        name = member.trim();
      } else if (member && member.name) {
        name = member.name.trim();
      }

      if (name) {
        processedMembers.push({
          name: name,
          isCaptain: name === normalizedCaptain,
        });
      }
    });
  }

  // Ensure captain is strictly added to the members list if not already there
  if (normalizedCaptain) {
    const captainExists = processedMembers.some(
      (m) => m.name === normalizedCaptain
    );
    if (!captainExists) {
      processedMembers.unshift({
        name: normalizedCaptain,
        isCaptain: true,
      });
    }
  }

  return processedMembers;
};

/**
 * ------------------------------------------------------------------
 * DATABASE HELPERS
 * ------------------------------------------------------------------
 */

/**
 * Resolves a Gallery Category by either its MongoDB _id or its Slug.

 */
export const resolveCategory = async (identifier) => {
  if (!identifier) return null;

  if (mongoose.Types.ObjectId.isValid(identifier)) {
    return await GalleryCategory.findById(identifier);
  } else {
    return await GalleryCategory.findOne({ slug: identifier });
  }
};
