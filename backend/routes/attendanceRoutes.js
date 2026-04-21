const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  markAttendance,
  markBulkAttendance,
  getAttendance,
  getAttendanceSummary,
  markEmployeeAttendance,
  markBulkEmployeeAttendance,
  getEmployeeAttendance,
  getStudentAttendanceReport,
  getEmployeeAttendanceReport,
  getClassWiseReport,
} = require("../controllers/attendanceController");

router.use(protect);

router.post("/", authorizeRoles("admin", "employee"), markAttendance);
router.post("/bulk", authorizeRoles("admin", "employee"), markBulkAttendance);
router.get("/", authorizeRoles("admin", "employee"), getAttendance);

// Reports — must be before /:param routes
router.get("/student-report", authorizeRoles("admin", "employee"), getStudentAttendanceReport);
router.get("/employee-report", authorizeRoles("admin"), getEmployeeAttendanceReport);
router.get("/class-report", authorizeRoles("admin", "employee"), getClassWiseReport);
router.get("/summary/:studentId", authorizeRoles("admin", "employee"), getAttendanceSummary);

// Employee attendance
router.post("/employee", authorizeRoles("admin"), markEmployeeAttendance);
router.post("/employee/bulk", authorizeRoles("admin"), markBulkEmployeeAttendance);
router.get("/employee", authorizeRoles("admin"), getEmployeeAttendance);

module.exports = router;
