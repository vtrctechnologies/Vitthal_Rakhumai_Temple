import cloudinary from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import https from "https";
import crypto from "crypto";

dotenv.config();

const cld = cloudinary.v2 || cloudinary;

cld.config({
  cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || "").trim(),
  api_key: (process.env.CLOUDINARY_API_KEY || "").trim(),
  api_secret: (process.env.CLOUDINARY_API_SECRET || "").trim(),
  secure: true,
});

// Diagnostic helper to obtain exact Cloudinary header reason on 403 / upload failure
const getCloudinaryErrorReason = () => {
  return new Promise((resolve) => {
    try {
      const cloud = (process.env.CLOUDINARY_CLOUD_NAME || "").trim();
      const key = (process.env.CLOUDINARY_API_KEY || "").trim();
      const secret = (process.env.CLOUDINARY_API_SECRET || "").trim();
      const timestamp = Math.floor(Date.now() / 1000);
      const strToSign = `timestamp=${timestamp}${secret}`;
      const signature = crypto.createHash("sha1").update(strToSign).digest("hex");

      const boundary = "------Boundary" + Date.now();
      const pixelBuffer = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64"
      );

      const pre = Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="api_key"\r\n\r\n${key}\r\n` +
          `--${boundary}\r\nContent-Disposition: form-data; name="timestamp"\r\n\r\n${timestamp}\r\n` +
          `--${boundary}\r\nContent-Disposition: form-data; name="signature"\r\n\r\n${signature}\r\n` +
          `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="test.png"\r\nContent-Type: image/png\r\n\r\n`
      );
      const post = Buffer.from(`\r\n--${boundary}--\r\n`);
      const payload = Buffer.concat([pre, pixelBuffer, post]);

      const req = https.request(
        {
          hostname: "api.cloudinary.com",
          path: `/v1_1/${cloud}/image/upload`,
          method: "POST",
          headers: {
            "Content-Type": `multipart/form-data; boundary=${boundary}`,
            "Content-Length": payload.length,
          },
        },
        (res) => {
          let text = "";
          res.on("data", (chunk) => (text += chunk));
          res.on("end", () => {
            const errHeader = res.headers["x-cld-error"];
            if (errHeader) return resolve(errHeader);
            try {
              const parsed = JSON.parse(text);
              if (parsed?.error?.message) return resolve(parsed.error.message);
            } catch {}
            resolve(text || `HTTP ${res.statusCode}`);
          });
        }
      );
      req.on("error", (e) => resolve(e.message));
      req.write(payload);
      req.end();
    } catch (e) {
      resolve(e.message);
    }
  });
};

/**
 * Upload buffer to Cloudinary with local fallback if Cloudinary credentials/account return 403
 * @param {Buffer} fileBuffer - File buffer from Multer memory storage
 * @param {String} folder - Cloudinary folder name
 * @param {String} resourceType - 'auto', 'image', or 'video'
 * @returns {Promise<Object>} Upload result containing secure_url and public_id
 */
export const uploadToCloudinary = (
  fileBuffer,
  folder = "vitthal_rakhumai_gallery",
  resourceType = "auto"
) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cld.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          getCloudinaryErrorReason().then((reason) => {
            console.warn(
              `⚠️ Cloudinary upload rejected (HTTP 403). Exact reason from Cloudinary: "${reason}". Saving file to local storage fallback.`
            );
          });
          try {
            const uploadsDir = path.join(process.cwd(), "uploads");
            if (!fs.existsSync(uploadsDir)) {
              fs.mkdirSync(uploadsDir, { recursive: true });
            }
            const ext = resourceType === "video" ? ".mp4" : ".jpg";
            const filename = `file_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
            const filepath = path.join(uploadsDir, filename);
            fs.writeFileSync(filepath, fileBuffer);

            const serverUrl =
              process.env.SERVER_URL ||
              `http://localhost:${process.env.PORT || 5000}`;
            const fileUrl = `${serverUrl}/uploads/${filename}`;

            return resolve({
              secure_url: fileUrl,
              url: fileUrl,
              public_id: `local_${filename}`,
              resource_type: resourceType === "auto" ? "image" : resourceType,
            });
          } catch (fallbackError) {
            console.error("Local upload fallback failed:", fallbackError);
            return reject(error);
          }
        }
        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Helper to construct Cloudinary subfolder path by category and year
 * @param {String} categorySlug - Slug or name of category
 * @param {Number|String} year - Year of the media asset
 * @returns {String} Subfolder path (e.g., "vitthal_rakhumai_gallery/festivals/2026")
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
 * Delete resource from Cloudinary or local storage
 * @param {String} publicId - Asset public ID
 * @param {String} resourceType - 'image' or 'video'
 * @returns {Promise<Object>} Deletion result
 */
export const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  try {
    if (!publicId) return { result: "ok" };

    if (publicId.startsWith("local_")) {
      const filename = publicId.replace("local_", "");
      const filepath = path.join(process.cwd(), "uploads", filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
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
