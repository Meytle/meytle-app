/**
 * Multer Configuration for File Uploads
 * Handles profile photos and government ID documents
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = {
  profiles: path.join(__dirname, '../uploads/profiles'),
  documents: path.join(__dirname, '../uploads/documents'),
};

Object.values(uploadDirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine destination based on field name
    if (file.fieldname === 'profilePhoto') {
      cb(null, uploadDirs.profiles);
    } else if (file.fieldname === 'governmentId' || file.fieldname === 'idDocument') {
      cb(null, uploadDirs.documents);
    } else {
      cb(new Error('Invalid field name'), null);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename: userId-timestamp-originalname
    const userId = req.user?.id || 'unknown';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '_') // Replace special chars
      .substring(0, 50); // Limit length
    
    const filename = `${userId}-${timestamp}-${baseName}${ext}`;
    cb(null, filename);
  }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  }
});

// Export upload middleware for different scenarios
module.exports = {
  upload,
  
  // For companion application (profile photo + government ID)
  uploadCompanionFiles: upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'governmentId', maxCount: 1 }
  ]),

  // For profile photo only
  uploadProfilePhoto: upload.single('profilePhoto'),

  // For ID document only (client verification)
  uploadIdDocument: upload.single('idDocument'),

  // Upload directories for serving files
  uploadDirs,
};

