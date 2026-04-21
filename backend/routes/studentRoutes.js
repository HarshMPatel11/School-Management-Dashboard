const express = require("express");
const router = express.Router();
const { uploadStudentPhoto } = require("../middleware/uploadMiddleware");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentStats,
  promoteStudents,
} = require("../controllers/studentController");

router.use(protect);

router.get("/stats/summary", authorizeRoles("admin", "employee"), getStudentStats);
router.post("/promote", authorizeRoles("admin"), promoteStudents);
router.post("/", authorizeRoles("admin"), uploadStudentPhoto.single("photo"), createStudent);
router.get("/", authorizeRoles("admin", "employee"), getStudents);
router.get("/:id", authorizeRoles("admin", "employee"), getStudentById);
router.put("/:id", authorizeRoles("admin"), uploadStudentPhoto.single("photo"), updateStudent);
router.delete("/:id", authorizeRoles("admin"), deleteStudent);

module.exports = router;
