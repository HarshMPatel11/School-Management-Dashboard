const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const Fee = require("../models/Fee");
const User = require("../models/User");

const parseStudentPayload = (req) => {
  const payload = {
    ...req.body,
  };

  if (req.file) {
    payload.photoUrl = `/uploads/students/${req.file.filename}`;
  }

  return payload;
};

const buildInitialStudentPassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 8; i += 1) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const ensureStudentCredentials = (student, { preservePassword = true } = {}) => {
  const fallbackUsername = String(student.rollNumber || "").trim().toLowerCase();
  const username = String(student.loginUsername || fallbackUsername).trim().toLowerCase();

  let password = String(student.loginPassword || "").trim();
  if (!password) {
    password = preservePassword ? String(student.rollNumber || "").trim() : "";
  }
  if (!password || !preservePassword) {
    password = buildInitialStudentPassword();
  }

  student.loginUsername = username;
  student.loginPassword = password;

  return { username, password };
};

const syncStudentAccount = async (student, previousRollNumber = "") => {
  const { username, password } = ensureStudentCredentials(student);

  if (!username) return;

  let account = await User.findOne({ role: "student", username });
  if (!account && previousRollNumber && previousRollNumber !== student.rollNumber) {
    account = await User.findOne({ role: "student", username: previousRollNumber.toLowerCase() });
  }

  if (account) {
    account.name = student.fullName;
    account.username = username;
    account.email = `${username}@student.local`;
    await account.save();
    await student.save();
    return;
  }

  await User.create({
    name: student.fullName,
    username,
    email: `${username}@student.local`,
    password,
    role: "student",
  });

  await student.save();
};

exports.createStudent = async (req, res) => {
  try {
    const payload = parseStudentPayload(req);

    payload.loginUsername = String(payload.rollNumber || "").trim().toLowerCase();
    payload.loginPassword = buildInitialStudentPassword();

    const student = await Student.create(payload);
    await syncStudentAccount(student);
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const { search = "", className = "", section = "", page = 1, limit = 10, all = "false" } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { rollNumber: { $regex: search, $options: "i" } },
        { parentName: { $regex: search, $options: "i" } },
      ];
    }

    if (className) query.className = className;
    if (section) query.section = section;

    const shouldReturnAll = String(all).toLowerCase() === "true";
    const pageNumber = Math.max(Number(page) || 1, 1);
    const pageSize = shouldReturnAll
      ? Math.min(Math.max(Number(limit) || 1000, 1), 5000)
      : Math.min(Math.max(Number(limit) || 10, 1), 100);
    const skip = (pageNumber - 1) * pageSize;

    const [students, total] = await Promise.all([
      Student.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
      Student.countDocuments(query),
    ]);

    res.json({
      data: students,
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

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.loginUsername || !student.loginPassword) {
      ensureStudentCredentials(student);
      await student.save();
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const existingStudent = await Student.findById(req.params.id);
    if (!existingStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    const student = await Student.findByIdAndUpdate(req.params.id, parseStudentPayload(req), {
      new: true,
      runValidators: true,
    });

    await syncStudentAccount(student, existingStudent.rollNumber);

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    await Attendance.deleteMany({ student: req.params.id });
    await Fee.deleteMany({ student: req.params.id });
    await User.deleteMany({ role: "student", username: String(student.rollNumber || "").toLowerCase() });

    res.json({ message: "Student and related records deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalAttendance = await Attendance.countDocuments({
      date: new Date().toISOString().slice(0, 10),
    });
    const totalFees = await Fee.aggregate([
      {
        $group: {
          _id: null,
          paid: { $sum: "$paidFee" },
          due: { $sum: "$dueFee" },
        },
      },
    ]);

    res.json({
      totalStudents,
      todayAttendanceMarked: totalAttendance,
      totalCollected: totalFees[0]?.paid || 0,
      totalDue: totalFees[0]?.due || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.promoteStudents = async (req, res) => {
  try {
    const { studentIds = [], targetClass = "", targetSection = "" } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: "Select at least one student to promote." });
    }

    if (!targetClass.trim()) {
      return res.status(400).json({ message: "Target class is required." });
    }

    const update = {
      className: targetClass.trim(),
    };

    if (targetSection.trim()) {
      update.section = targetSection.trim();
    }

    const result = await Student.updateMany(
      { _id: { $in: studentIds } },
      { $set: update }
    );

    res.json({
      message: `${result.modifiedCount} student(s) promoted successfully.`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
