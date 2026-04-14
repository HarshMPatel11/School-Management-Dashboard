const Class = require("../models/Class");

exports.createClass = async (req, res) => {
  try {
    const classData = await Class.create(req.body);
    res.status(201).json(classData);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "A class with this name already exists." });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.getClasses = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { classTeacher: { $regex: search, $options: "i" } },
      ];
    }

    const pageNumber = Math.max(Number(page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const skip = (pageNumber - 1) * pageSize;

    const [classes, total] = await Promise.all([
      Class.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
      Class.countDocuments(query),
    ]);

    res.json({
      data: classes,
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

exports.getClassById = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }
    res.json(classData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const classData = await Class.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }
    res.json(classData);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "A class with this name already exists." });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const classData = await Class.findByIdAndDelete(req.params.id);
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }
    res.json({ message: "Class deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getClassStats = async (req, res) => {
  try {
    const total = await Class.countDocuments();
    res.json({ total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
