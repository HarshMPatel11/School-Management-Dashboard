const fs = require("fs");
const path = require("path");
const multer = require("multer");

const employeeUploadDir = path.join(__dirname, "..", "uploads", "employees");
const studentUploadDir = path.join(__dirname, "..", "uploads", "students");
fs.mkdirSync(employeeUploadDir, { recursive: true });
fs.mkdirSync(studentUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, employeeUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = ext || ".jpg";
    cb(null, `emp-${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

const imageFileFilter = (req, file, cb) => {
  if (!file.mimetype || !file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed."));
  }
  cb(null, true);
};

const uploadEmployeePhoto = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 100 * 1024,
  },
});

const studentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, studentUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = ext || ".jpg";
    cb(null, `std-${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

const uploadStudentPhoto = multer({
  storage: studentStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 100 * 1024,
  },
});

module.exports = {
  uploadEmployeePhoto,
  uploadStudentPhoto,
};
