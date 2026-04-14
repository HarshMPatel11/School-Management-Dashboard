const express = require("express");
const router = express.Router();
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

router.post("/", markAttendance);
router.post("/bulk", markBulkAttendance);
router.get("/", getAttendance);

// Reports — must be before /:param routes
router.get("/student-report", getStudentAttendanceReport);
router.get("/employee-report", getEmployeeAttendanceReport);
router.get("/class-report", getClassWiseReport);
router.get("/summary/:studentId", getAttendanceSummary);

// Employee attendance
router.post("/employee", markEmployeeAttendance);
router.post("/employee/bulk", markBulkEmployeeAttendance);
router.get("/employee", getEmployeeAttendance);

module.exports = router;
