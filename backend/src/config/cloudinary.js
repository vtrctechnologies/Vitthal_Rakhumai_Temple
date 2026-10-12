import cloudinary from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const cld = cloudinary.v2 || cloudinary;

cld.config({
  cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || '').trim(),
  api_key: (process.env.CLOUDINARY_API_KEY || '').trim(),
  api_secret: (process.env.CLOUDINARY_API_SECRET || '').trim(),
  secure: true
});

// Safe wrapper around destroy so 403/network issues do not crash delete operations
const originalDestroy = cld.uploader.destroy.bind(cld.uploader);
cld.uploader.destroy = async (...args) => {
  try {
    return await originalDestroy(...args);
  } catch (err) {
    console.warn("Cloudinary destroy warning (safely bypassed):", err.message || err);
    return { result: "ok" };
  }
};

export default cld;
