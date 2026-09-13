import { Router } from 'express';
import multer from 'multer';
import { imagekit } from '../utils/imagekit';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

// Multer config: store files in memory (buffer), max 5MB.
// This server-side MIME check is the SECURITY BOUNDARY. Any client-side
// MIME validation is purely for UX (faster feedback) and is NOT trusted.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only JPG, PNG, WEBP, and HEIC are allowed.`));
      return;
    }
    cb(null, true);
  },
});

/**
 * POST /api/v1/upload
 * Protected: Upload an image to ImageKit and return its CDN URL.
 *
 * Expects: multipart/form-data with a single file field named "image"
 * Optional query param: folder (defaults to "item-images")
 * Returns: { url: string }
 */
router.post(
  '/',
  authenticate,
  upload.single('image'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: { message: 'No image file provided' } });
      }

      const folder = (req.query.folder as string) || 'item-images';
      const fileExt = req.file.originalname.split('.').pop() || 'jpg';
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;

      const result = await imagekit.upload({
        file: req.file.buffer, // buffer from multer memoryStorage
        fileName,
        folder: `/${folder}`,
        tags: [folder],
      });

      return res.status(200).json({ url: result.url });
    } catch (error: any) {
      // Handle multer file-size errors
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: { message: 'File is too large. Maximum allowed size is 5MB.' } });
      }
      next(error);
    }
  }
);

export default router;
