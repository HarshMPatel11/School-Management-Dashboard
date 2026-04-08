const express = require("express");
const router = express.Router();
const {
  markAttendance,
  getAttendance,
  getAttendanceSummary,
} = require("../controllers/attendanceController");

router.post("/", markAttendance);
router.get("/", getAttendance);
router.get("/summary/:studentId", getAttendanceSummary);

module.exports = router;
