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
    const { date = "", studentId = "", page = 1, limit = 10 } = req.query;

    const query = {};
    if (date) query.date = date;
    if (studentId) query.student = studentId;

    const pageNumber = Math.max(Number(page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const skip = (pageNumber - 1) * pageSize;

    const [records, total] = await Promise.all([
      Attendance.find(query)
        .populate("student")
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      Attendance.countDocuments(query),
    ]);

    res.json({
      data: records,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    });
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
