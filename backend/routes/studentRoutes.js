const express = require("express");
const router = express.Router();
const { uploadStudentPhoto } = require("../middleware/uploadMiddleware");
const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentStats,
  promoteStudents,
} = require("../controllers/studentController");

router.get("/stats/summary", getStudentStats);
router.post("/promote", promoteStudents);
router.post("/", uploadStudentPhoto.single("photo"), createStudent);
router.get("/", getStudents);
router.get("/:id", getStudentById);
router.put("/:id", uploadStudentPhoto.single("photo"), updateStudent);
router.delete("/:id", deleteStudent);

module.exports = router;
