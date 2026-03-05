const uploadService = require("../services/uploadService");

/**
 * ADMIN: Upload file
 * POST /api/admin/upload
 */
const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
        details: "Please provide a file in the 'file' field",
      });
    }

    const result = await uploadService.saveFile(req.file);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
};

/**
 * ADMIN: Upload multiple files
 * POST /api/admin/upload/multiple
 */
const uploadMultipleFiles = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: "No files uploaded",
        details: "Please provide files in the 'files' field",
      });
    }

    const results = await Promise.all(
      req.files.map((file) => uploadService.saveFile(file))
    );

    return res.status(201).json(results);
  } catch (error) {
    return next(error);
  }
};

/**
 * ADMIN: Delete file
 * DELETE /api/admin/upload/:filename
 */
const deleteFile = async (req, res, next) => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).json({
        error: "Filename required",
      });
    }

    const result = await uploadService.deleteFile(filename);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
};

/**
 * ADMIN: List all uploaded files
 * GET /api/admin/upload
 */
const listFiles = async (req, res, next) => {
  try {
    const files = await uploadService.listFiles();
    return res.json(files);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
  listFiles,
};
