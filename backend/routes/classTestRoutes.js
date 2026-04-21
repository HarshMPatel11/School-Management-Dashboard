const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  listClassTests,
  getClassTestMarksSheet,
  saveClassTestMarks,
  getClassTestResults,
} = require("../controllers/classTestController");

router.use(protect, authorizeRoles("admin"));

router.get("/", listClassTests);
router.get("/marks-sheet", getClassTestMarksSheet);
router.post("/marks", saveClassTestMarks);
router.get("/results", getClassTestResults);

module.exports = router;
