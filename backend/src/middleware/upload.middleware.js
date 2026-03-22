import multer from 'multer';
import pkg from 'multer-storage-cloudinary';
const { CloudinaryStorage } = pkg;
import cloudinary from '../config/cloudinary.js';

// Configure storage for images
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'vrtemple/banners/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    resource_type: 'image'
  }
});

// Configure storage for videos
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'vrtemple/banners/videos',
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv'],
    resource_type: 'video'
  }
});

// For banners, we can use a generic storage that decides based on file extension or just use image for now as requested by UI
// However, the user asked for both images and videos.
// We'll use "auto" resource type if possible, or create separate instances.

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video');
    return {
      folder: isVideo ? 'vrtemple/banners/videos' : 'vrtemple/banners/images',
      resource_type: isVideo ? 'video' : 'image',
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`
    };
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit for videos
  }
});

export default upload;
