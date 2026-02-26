import { Router, Response } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// ---------------------------------------------------------------------------
// Multer configuration
// ---------------------------------------------------------------------------

// Ensure the uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedMimeTypes = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only PDF, PNG, and JPEG files are allowed', 400));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max
  },
});

// ---------------------------------------------------------------------------
// Helper: generate a mock IPFS hash (CIDv1-like)
// ---------------------------------------------------------------------------

function generateMockIpfsHash(fileBuffer: Buffer): string {
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  // Create a mock CID that looks realistic (Qm prefix for CIDv0 style)
  return `Qm${hash.substring(0, 44)}`;
}

// ---------------------------------------------------------------------------
// POST / — Upload PDF file (auth required)
// ---------------------------------------------------------------------------

router.post(
  '/',
  authMiddleware,
  upload.single('file'),
  async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const file = req.file;

    // Read the file to generate a hash
    const fileBuffer = fs.readFileSync(file.path);
    const ipfsHash = generateMockIpfsHash(fileBuffer);

    // Build mock IPFS gateway URL
    const gatewayBase =
      process.env.PINATA_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs';
    const url = `${gatewayBase}/${ipfsHash}`;

    res.status(201).json({
      ipfsHash,
      url,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      localPath: file.path,
    });
  },
);

export default router;
