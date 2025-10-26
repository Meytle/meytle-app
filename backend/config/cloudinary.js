/**
 * Cloudinary Configuration
 * Handles file uploads to Cloudinary cloud storage (production only)
 */

const cloudinary = require('cloudinary').v2;
const path = require('path');

// Only configure Cloudinary in production
if (process.env.NODE_ENV === 'production') {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Upload file to Cloudinary (production) or return local path (development)
const uploadToCloudinary = async (file, folder = 'meytle') => {
  // In development, return local file path
  if (process.env.NODE_ENV !== 'production') {
    const localPath = `/uploads/${folder}/${file.filename}`;
    return {
      success: true,
      url: localPath,
      public_id: null,
    };
  }

  // In production, upload to Cloudinary
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: folder,
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
    });
    
    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Delete file from Cloudinary (production only)
const deleteFromCloudinary = async (publicId) => {
  // In development, do nothing (local files)
  if (process.env.NODE_ENV !== 'production') {
    return {
      success: true,
      result: 'skipped (development)',
    };
  }

  // In production, delete from Cloudinary
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === 'ok',
      result: result.result,
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
};
