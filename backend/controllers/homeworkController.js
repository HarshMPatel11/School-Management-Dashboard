const ClassModel = require("../models/Class");
const Employee = require("../models/Employee");
const Homework = require("../models/Homework");
const Subject = require("../models/Subject");

const normalizeDateOnly = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setHours(0, 0, 0, 0);
  return date;
};

const validateHomeworkPayload = async ({ className, teacherName, subjectName }) => {
  const trimmedClass = String(className || "").trim();
  const trimmedTeacher = String(teacherName || "").trim();
  const trimmedSubject = String(subjectName || "").trim();

  const classDoc = await ClassModel.findOne({ name: trimmedClass });
  if (!classDoc) {
    const error = new Error("Selected class does not exist");
    error.statusCode = 400;
    throw error;
  }

  const teacherDoc = await Employee.findOne({ employeeName: trimmedTeacher, role: "Teacher" });
  if (!teacherDoc) {
    const error = new Error("Selected teacher does not exist");
    error.statusCode = 400;
    throw error;
  }

  const subjectDoc = await Subject.findOne({ classRef: classDoc._id });
  const subjectExists = (subjectDoc?.subjects || []).some((item) => item.name === trimmedSubject);
  if (!subjectExists) {
    const error = new Error("Selected subject is not assigned to this class");
    error.statusCode = 400;
    throw error;
  }
};

exports.createHomework = async (req, res) => {
  try {
    const { homeworkDate, className, teacherName, subjectName, assignment } = req.body;
    const normalizedDate = normalizeDateOnly(homeworkDate);

    if (!normalizedDate || !className || !teacherName || !subjectName || !String(assignment || "").trim()) {
      return res.status(400).json({ message: "Date, class, teacher, subject and assignment are required" });
    }

    await validateHomeworkPayload({ className, teacherName, subjectName });

    const homework = await Homework.create({
      homeworkDate: normalizedDate,
      className: String(className).trim(),
      teacherName: String(teacherName).trim(),
      subjectName: String(subjectName).trim(),
      assignment: String(assignment).trim(),
    });

    res.status(201).json(homework);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.getHomework = async (req, res) => {
  try {
    const { homeworkDate = "", className = "", teacherName = "" } = req.query;
    const query = {};

    if (homeworkDate) {
      const normalizedDate = normalizeDateOnly(homeworkDate);
      if (normalizedDate) {
        query.homeworkDate = normalizedDate;
      }
    }
    if (className) {
      query.className = className;
    }
    if (teacherName) {
      query.teacherName = teacherName;
    }

    const homework = await Homework.find(query).sort({ homeworkDate: -1, createdAt: -1 });
    res.json(homework);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateHomework = async (req, res) => {
  try {
    const { homeworkDate, className, teacherName, subjectName, assignment } = req.body;
    const normalizedDate = normalizeDateOnly(homeworkDate);

    if (!normalizedDate || !className || !teacherName || !subjectName || !String(assignment || "").trim()) {
      return res.status(400).json({ message: "Date, class, teacher, subject and assignment are required" });
    }

    await validateHomeworkPayload({ className, teacherName, subjectName });

    const updated = await Homework.findByIdAndUpdate(
      req.params.id,
      {
        homeworkDate: normalizedDate,
        className: String(className).trim(),
        teacherName: String(teacherName).trim(),
        subjectName: String(subjectName).trim(),
        assignment: String(assignment).trim(),
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Homework not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.deleteHomework = async (req, res) => {
  try {
    const deleted = await Homework.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Homework not found" });
    }

    res.json({ message: "Homework deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
