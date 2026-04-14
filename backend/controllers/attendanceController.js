const Attendance = require("../models/Attendance");
const EmployeeAttendance = require("../models/EmployeeAttendance");

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
    const { date = "", studentId = "", page = 1, limit = 10, all = "false" } = req.query;

    const query = {};
    if (date) query.date = date;
    if (studentId) query.student = studentId;

    const shouldReturnAll = String(all).toLowerCase() === "true";
    const pageNumber = Math.max(Number(page) || 1, 1);
    const pageSize = shouldReturnAll
      ? Math.min(Math.max(Number(limit) || 1000, 1), 5000)
      : Math.min(Math.max(Number(limit) || 10, 1), 100);
    const skip = (pageNumber - 1) * pageSize;

    const recordsQuery = Attendance.find(query)
      .populate("student")
      .sort({ date: -1, createdAt: -1 });

    const records = shouldReturnAll
      ? await recordsQuery
      : await recordsQuery.skip(skip).limit(pageSize);

    const total = await Attendance.countDocuments(query);

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

exports.markBulkAttendance = async (req, res) => {
  try {
    const { date, records = [] } = req.body;

    if (!date) {
      return res.status(400).json({ message: "Date is required." });
    }

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: "At least one attendance row is required." });
    }

    const operations = records
      .filter((row) => row?.student && row?.status)
      .map((row) => ({
        updateOne: {
          filter: { student: row.student, date },
          update: { $set: { student: row.student, date, status: row.status } },
          upsert: true,
        },
      }));

    if (operations.length === 0) {
      return res.status(400).json({ message: "No valid attendance rows found." });
    }

    await Attendance.bulkWrite(operations, { ordered: false });

    res.json({ message: "Student attendance updated successfully." });
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

// ── Employee Attendance ──────────────────────────────────

exports.markEmployeeAttendance = async (req, res) => {
  try {
    const { employee, date, status } = req.body;
    const record = await EmployeeAttendance.findOneAndUpdate(
      { employee, date },
      { employee, date, status },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEmployeeAttendance = async (req, res) => {
  try {
    const { date = "", employeeId = "", page = 1, limit = 10, all = "false" } = req.query;
    const query = {};
    if (date) query.date = date;
    if (employeeId) query.employee = employeeId;

    const shouldReturnAll = String(all).toLowerCase() === "true";
    const pageNumber = Math.max(Number(page) || 1, 1);
    const pageSize = shouldReturnAll
      ? Math.min(Math.max(Number(limit) || 1000, 1), 5000)
      : Math.min(Math.max(Number(limit) || 10, 1), 100);
    const skip = (pageNumber - 1) * pageSize;

    const recordsQuery = EmployeeAttendance.find(query)
      .populate("employee")
      .sort({ date: -1, createdAt: -1 });

    const records = shouldReturnAll
      ? await recordsQuery
      : await recordsQuery.skip(skip).limit(pageSize);

    const total = await EmployeeAttendance.countDocuments(query);

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

exports.markBulkEmployeeAttendance = async (req, res) => {
  try {
    const { date, records = [] } = req.body;

    if (!date) {
      return res.status(400).json({ message: "Date is required." });
    }

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: "At least one attendance row is required." });
    }

    const operations = records
      .filter((row) => row?.employee && row?.status)
      .map((row) => ({
        updateOne: {
          filter: { employee: row.employee, date },
          update: { $set: { employee: row.employee, date, status: row.status } },
          upsert: true,
        },
      }));

    if (operations.length === 0) {
      return res.status(400).json({ message: "No valid attendance rows found." });
    }

    await EmployeeAttendance.bulkWrite(operations, { ordered: false });

    res.json({ message: "Employee attendance updated successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Reports ──────────────────────────────────────────────

exports.getStudentAttendanceReport = async (req, res) => {
  try {
    const { from = "", to = "" } = req.query;
    const match = {};
    if (from || to) {
      match.date = {};
      if (from) match.date.$gte = from;
      if (to) match.date.$lte = to;
    }

    const results = await Attendance.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$date",
          present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ["$status", "Late"] }, 1, 0] } },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    res.json(
      results.map((r) => ({
        date: r._id,
        present: r.present,
        absent: r.absent,
        late: r.late,
        total: r.total,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEmployeeAttendanceReport = async (req, res) => {
  try {
    const { from = "", to = "" } = req.query;
    const match = {};
    if (from || to) {
      match.date = {};
      if (from) match.date.$gte = from;
      if (to) match.date.$lte = to;
    }

    const results = await EmployeeAttendance.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$date",
          present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ["$status", "Late"] }, 1, 0] } },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    res.json(
      results.map((r) => ({
        date: r._id,
        present: r.present,
        absent: r.absent,
        late: r.late,
        total: r.total,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getClassWiseReport = async (req, res) => {
  try {
    const { date = "" } = req.query;
    const query = {};
    if (date) query.date = date;

    const records = await Attendance.find(query).populate("student");

    const classMap = {};
    records.forEach((r) => {
      const cls = r.student?.className || "Unknown";
      if (!classMap[cls]) {
        classMap[cls] = { className: cls, present: 0, absent: 0, late: 0, total: 0 };
      }
      classMap[cls].total++;
      if (r.status === "Present") classMap[cls].present++;
      else if (r.status === "Absent") classMap[cls].absent++;
      else if (r.status === "Late") classMap[cls].late++;
    });

    const data = Object.values(classMap).sort((a, b) =>
      a.className.localeCompare(b.className)
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
