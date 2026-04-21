const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  createExam,
  getExams,
  updateExam,
  deleteExam,
  getExamMarksSheet,
  saveExamMarks,
  getExamStudentResult,
  getExamClassResults,
} = require("../controllers/examController");

router.use(protect, authorizeRoles("admin"));

router.get("/", getExams);
router.post("/", createExam);
router.put("/:id", updateExam);
router.delete("/:id", deleteExam);
router.get("/marks-sheet", getExamMarksSheet);
router.post("/marks", saveExamMarks);
router.get("/result/student", getExamStudentResult);
router.get("/result/class", getExamClassResults);

module.exports = router;
