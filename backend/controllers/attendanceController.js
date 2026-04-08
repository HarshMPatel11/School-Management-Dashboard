const Attendance = require("../models/Attendance");

exports.markAttendance = async (req, res) => {
  try {
    const { student, date, status } = req.body;

    const record = await Attendance.findOneAndUpdate(
      { student, date },
      { student, date, status },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const { date = "", studentId = "" } = req.query;

    const query = {};
    if (date) query.date = date;
    if (studentId) query.student = studentId;

    const records = await Attendance.find(query)
      .populate("student")
      .sort({ date: -1, createdAt: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAttendanceSummary = async (req, res) => {
  try {
    const { studentId } = req.params;
    const records = await Attendance.find({ student: studentId });

    const total = records.length;
    const present = records.filter((r) => r.status === "Present").length;
    const absent = records.filter((r) => r.status === "Absent").length;
    const late = records.filter((r) => r.status === "Late").length;
    const percentage = total ? (((present + late) / total) * 100).toFixed(2) : "0.00";

    res.json({ total, present, absent, late, percentage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
