import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const generatePublicId = (file) => {
  const baseName = path.basename(file.originalname, path.extname(file.originalname));
  return `${Date.now()}-${baseName}`;
};

const getFileFormat = (file) => path.extname(file.originalname).substring(1);

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'TEMP_UPLOADS',
    resource_type: 'image',
    public_id: (req, file) => generatePublicId(file),
    format: (req, file) => getFileFormat(file),
  },
});

const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only jpg, jpeg, and png images are allowed.'), false);
  }
};

export const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
