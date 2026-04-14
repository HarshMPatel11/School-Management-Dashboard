const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Student = require("../models/Student");
const Employee = require("../models/Employee");

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });

exports.login = async (req, res) => {
  try {
    const { email, password, identifier, role = "admin" } = req.body;
    const loginIdentifier = String(identifier || email || "").trim().toLowerCase();
    const loginRole = String(role || "admin").toLowerCase();

    if (!loginIdentifier || !password) {
      return res.status(400).json({ message: "Login ID and password are required" });
    }

    if (!["admin", "employee", "student"].includes(loginRole)) {
      return res.status(400).json({ message: "Invalid login role" });
    }

    let user = null;
    if (loginRole === "admin") {
      user = await User.findOne({
        role: { $in: ["admin", "staff"] },
        $or: [{ email: loginIdentifier }, { username: loginIdentifier }],
      });
    } else {
      user = await User.findOne({
        role: { $in: [loginRole, "staff"] },
        $or: [{ username: loginIdentifier }, { email: loginIdentifier }],
      });
    }

    if (!user) {
      return res.status(401).json({ message: `No ${loginRole} account found for this login ID` });
    }

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Wrong password" });
    }

    res.json({
      token: signToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, identifier, password, role } = req.body;
    const normalizedRole = String(role || "").toLowerCase();
    const normalizedIdentifier = String(identifier || "").trim().toLowerCase();

    if (!name || !normalizedIdentifier || !password || !normalizedRole) {
      return res.status(400).json({ message: "Name, role, login ID and password are required" });
    }

    if (!["admin", "employee", "student"].includes(normalizedRole)) {
      return res.status(400).json({ message: "Role must be admin, employee or student" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingByUsername = await User.findOne({ username: normalizedIdentifier });
    const existingByEmail = await User.findOne({ email: normalizedIdentifier });
    if (existingByUsername || existingByEmail) {
      return res.status(409).json({ message: "Account already exists" });
    }

    const payload = {
      name,
      password,
      role: normalizedRole,
    };

    if (normalizedRole === "admin") {
      payload.email = normalizedIdentifier;
      payload.username = normalizedIdentifier;
    } else {
      payload.username = normalizedIdentifier;
      payload.email = `${normalizedIdentifier}@${normalizedRole}.local`;
    }

    const user = await User.create(payload);

    res.status(201).json({
      message: "Account created successfully",
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};

exports.createStaff = async (req, res) => {
  try {
    const { name, email, password, role = "staff", username = "" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    if (!["admin", "staff", "employee", "student"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      username: username ? username.toLowerCase() : undefined,
      password,
      role,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.syncRoleAccounts = async (req, res) => {
  try {
    const students = await Student.find({}, { fullName: 1, rollNumber: 1 });
    const employees = await Employee.find({}, { employeeName: 1, mobile: 1 });

    let createdStudents = 0;
    let createdEmployees = 0;

    for (const student of students) {
      const username = String(student.rollNumber || "").trim().toLowerCase();
      if (!username) continue;

      const exists = await User.findOne({ role: "student", username });
      if (exists) continue;

      await User.create({
        name: student.fullName,
        username,
        email: `${username}@student.local`,
        password: student.rollNumber,
        role: "student",
      });
      createdStudents += 1;
    }

    for (const employee of employees) {
      const username = String(employee.mobile || "").trim().toLowerCase();
      if (!username) continue;

      const exists = await User.findOne({ role: "employee", username });
      if (exists) continue;

      await User.create({
        name: employee.employeeName,
        username,
        email: `${username}@employee.local`,
        password: employee.mobile,
        role: "employee",
      });
      createdEmployees += 1;
    }

    res.json({
      message: "Role accounts synchronized",
      createdStudents,
      createdEmployees,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
