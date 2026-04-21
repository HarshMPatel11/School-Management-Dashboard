const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  getPortalMe,
  getStudentDashboard,
  getStudentFees,
  getStudentExamResults,
  getStudentReportCard,
  getStudentClassTestResults,
  updateStudentAccount,
} = require("../controllers/studentPortalController");

router.use(protect, authorizeRoles("student"));

router.get("/me", getPortalMe);
router.get("/dashboard", getStudentDashboard);
router.get("/fees", getStudentFees);
router.get("/exam-results", getStudentExamResults);
router.get("/report-card", getStudentReportCard);
router.get("/class-test-results", getStudentClassTestResults);
router.put("/account", updateStudentAccount);

module.exports = router;
