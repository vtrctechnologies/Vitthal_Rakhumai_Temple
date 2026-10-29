import cloudinary from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const cld = cloudinary.v2 || cloudinary;

cld.config({
  cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || "").trim(),
  api_key: (process.env.CLOUDINARY_API_KEY || "").trim(),
  api_secret: (process.env.CLOUDINARY_API_SECRET || "").trim(),
  secure: true,
});

/**
 * Uploads media asset strictly to Cloudinary CDN (no local disk fallback).
 * Streams directly from disk path or memory buffer to eliminate memory exhaustion (SEC-014).
 *
 * @param {string|Buffer|Object} fileInput - Temporary file path, Buffer, or Multer file object
 * @param {string} folder - Target Cloudinary folder
 * @param {string} resourceType - 'auto', 'image', or 'video'
 * @returns {Promise<Object>} Cloudinary upload result containing secure_url and public_id
 */
export const uploadToCloudinary = async (
  fileInput,
  folder = "vitthal_rakhumai_gallery",
  resourceType = "auto"
) => {
  if (!fileInput) {
    throw new Error("No media file or buffer provided for Cloudinary upload");
  }

  const filePath =
    typeof fileInput === "string"
      ? fileInput
      : typeof fileInput === "object" && fileInput.path
      ? fileInput.path
      : null;

  const buffer =
    Buffer.isBuffer(fileInput)
      ? fileInput
      : typeof fileInput === "object" && Buffer.isBuffer(fileInput.buffer)
      ? fileInput.buffer
      : null;

  if (!filePath && !buffer) {
    throw new Error("Invalid media input: neither file path nor buffer available");
  }

  const options = {
    folder,
    resource_type: resourceType,
  };

  try {
    if (filePath && fs.existsSync(filePath)) {
      // Stream file directly from temporary disk storage to Cloudinary (zero Node heap RAM overhead)
      const result = await cld.uploader.upload(filePath, options);
      return result;
    } else if (buffer) {
      // Fallback for direct memory buffers (e.g. testing or programmatic calls)
      return await new Promise((resolve, reject) => {
        const uploadStream = cld.uploader.upload_stream(options, (error, result) => {
          if (error) {
            return reject(
              new Error(`Cloudinary upload failed: ${error.message || "Unknown Cloudinary error"}`)
            );
          }
          resolve(result);
        });
        uploadStream.end(buffer);
      });
    } else {
      throw new Error("File path does not exist on disk for upload");
    }
  } catch (error) {
    console.error("Cloudinary upload error:", error.message || error);
    throw new Error(`Media upload failed: ${error.message || "Cloudinary error"}`);
  } finally {
    // Automatically cleanup temporary streaming file if a path was used
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch {}
    }
  }
};

/**
 * Constructs Cloudinary subfolder path by category and year.
 *
 * @param {string} categorySlug - Slug or name of category
 * @param {number|string} year - Year of the media asset
 * @returns {string} Subfolder path (e.g., "vitthal_rakhumai_gallery/festivals/2026")
 */
export const getCloudinaryFolderPath = (categorySlug, year) => {
  const baseFolder = process.env.CLOUDINARY_BASE_FOLDER || "vitthal_rakhumai_gallery";
  const sanitizedCategory = (categorySlug || "general")
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  const targetYear = year || new Date().getFullYear();

  return `${baseFolder}/${sanitizedCategory}/${targetYear}`;
};

/**
 * Deletes an asset strictly from Cloudinary CDN.
 *
 * @param {string} publicId - Cloudinary asset public ID
 * @param {string} resourceType - 'image' or 'video'
 * @returns {Promise<Object>} Deletion result
 */
export const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  try {
    if (!publicId || typeof publicId !== "string") return { result: "ok" };

    // Media is solely stored on Cloudinary; reject traversal and ignore local IDs safely
    if (publicId.startsWith("local_")) {
      const rawTarget = publicId.replace(/^local_/, "").trim();
      if (!rawTarget || rawTarget.includes("\0") || rawTarget.includes("..")) {
        console.warn(`[Security Alert] Blocked path traversal attempt in deleteFromCloudinary: "${publicId}"`);
        return { result: "error", error: "Path traversal attempt blocked" };
      }
      return { result: "ok" };
    }

    const result = await cld.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.warn("Notice: Asset deletion bypassed (safe):", error.message || error);
    return { result: "ok" };
  }
};

export default cld;
