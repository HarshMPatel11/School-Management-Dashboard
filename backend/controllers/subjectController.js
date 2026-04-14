const Subject = require("../models/Subject");

const normalizeSubjects = (items = []) => {
  return items
    .map((item) => ({
      name: String(item.name || "").trim(),
      marks: Number(item.marks),
    }))
    .filter((item) => item.name && Number.isFinite(item.marks) && item.marks > 0);
};

exports.assignSubjects = async (req, res) => {
  try {
    const { classRef, subjects = [] } = req.body;

    if (!classRef) {
      return res.status(400).json({ message: "Class is required." });
    }

    const normalized = normalizeSubjects(subjects);
    if (normalized.length === 0) {
      return res.status(400).json({ message: "At least one valid subject is required." });
    }

    const doc = await Subject.findOneAndUpdate(
      { classRef },
      { classRef, subjects: normalized },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).populate("classRef", "name sections");

    res.status(201).json(doc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getClassesWithSubjects = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;

    const pageNumber = Math.max(Number(page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 100);

    const query = {};
    if (search) {
      query["classRef.name"] = { $regex: search, $options: "i" };
    }

    const all = await Subject.find().populate("classRef", "name sections").sort({ updatedAt: -1 });
    const filtered = all.filter((item) => {
      const className = item.classRef?.name || "";
      return !search || className.toLowerCase().includes(search.toLowerCase());
    });

    const total = filtered.length;
    const start = (pageNumber - 1) * pageSize;
    const paged = filtered.slice(start, start + pageSize);

    const data = paged.map((item) => {
      const totalMarks = item.subjects.reduce((sum, s) => sum + Number(s.marks || 0), 0);
      return {
        _id: item._id,
        classRef: item.classRef,
        subjects: item.subjects,
        totalSubjects: item.subjects.length,
        totalMarks,
        updatedAt: item.updatedAt,
      };
    });

    res.json({
      data,
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

exports.getSubjectsByClass = async (req, res) => {
  try {
    const subjectDoc = await Subject.findOne({ classRef: req.params.classId }).populate("classRef", "name sections");
    if (!subjectDoc) {
      return res.status(404).json({ message: "No subjects assigned to this class yet." });
    }

    const totalMarks = subjectDoc.subjects.reduce((sum, s) => sum + Number(s.marks || 0), 0);
    res.json({
      _id: subjectDoc._id,
      classRef: subjectDoc.classRef,
      subjects: subjectDoc.subjects,
      totalSubjects: subjectDoc.subjects.length,
      totalMarks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteSubjectAssignment = async (req, res) => {
  try {
    const deleted = await Subject.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Subject assignment not found" });
    }
    res.json({ message: "Subject assignment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
