const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Upload directory configuration
const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "5242880", 10); // 5MB default
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".pdf"];

/**
 * Ensure upload directory exists
 */
const ensureUploadDir = () => {
  const uploadPath = path.resolve(UPLOAD_DIR);
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  return uploadPath;
};

/**
 * Generate unique filename
 */
const generateFilename = (originalName) => {
  const ext = path.extname(originalName).toLowerCase();
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString("hex");
  return `${timestamp}-${random}${ext}`;
};

/**
 * Validate file
 */
const validateFile = (file) => {
  const errors = [];

  if (!file) {
    errors.push("No file provided");
    return errors;
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File size exceeds maximum allowed (${MAX_FILE_SIZE / 1024 / 1024}MB)`);
  }

  // Check MIME type
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    errors.push(`File type not allowed. Allowed types: ${ALLOWED_TYPES.join(", ")}`);
  }

  // Check extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    errors.push(`File extension not allowed. Allowed extensions: ${ALLOWED_EXTENSIONS.join(", ")}`);
  }

  return errors;
};

/**
 * Save uploaded file
 */
const saveFile = async (file) => {
  // Validate file
  const errors = validateFile(file);
  if (errors.length > 0) {
    const error = new Error(errors.join("; "));
    error.status = 400;
    throw error;
  }

  // Ensure upload directory exists
  const uploadPath = ensureUploadDir();

  // Generate unique filename
  const filename = generateFilename(file.originalname);
  const filePath = path.join(uploadPath, filename);

  // Write file
  await fs.promises.writeFile(filePath, file.buffer);

  // Generate URL (relative to server)
  const baseUrl = process.env.BASE_URL || "";
  const url = `${baseUrl}/uploads/${filename}`;

  return {
    url,
    filename,
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
  };
};

/**
 * Delete file by filename or URL
 */
const deleteFile = async (filenameOrUrl) => {
  // Extract filename from URL if needed
  const filename = filenameOrUrl.includes("/")
    ? path.basename(filenameOrUrl)
    : filenameOrUrl;

  const uploadPath = path.resolve(UPLOAD_DIR);
  const filePath = path.join(uploadPath, filename);

  // Security check: ensure file is within upload directory
  if (!filePath.startsWith(uploadPath)) {
    const error = new Error("Invalid file path");
    error.status = 400;
    throw error;
  }

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    const error = new Error("File not found");
    error.status = 404;
    throw error;
  }

  // Delete file
  await fs.promises.unlink(filePath);

  return { success: true, filename };
};

/**
 * List all uploaded files
 */
const listFiles = async () => {
  const uploadPath = ensureUploadDir();
  const files = await fs.promises.readdir(uploadPath);
  
  const baseUrl = process.env.BASE_URL || "";
  
  const fileInfos = await Promise.all(
    files.map(async (filename) => {
      const filePath = path.join(uploadPath, filename);
      const stats = await fs.promises.stat(filePath);
      
      return {
        filename,
        url: `${baseUrl}/uploads/${filename}`,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
      };
    })
  );

  return fileInfos.sort((a, b) => b.createdAt - a.createdAt);
};

module.exports = {
  saveFile,
  deleteFile,
  listFiles,
  validateFile,
  ensureUploadDir,
  ALLOWED_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
};
