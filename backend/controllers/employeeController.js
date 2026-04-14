const Employee = require("../models/Employee");
const User = require("../models/User");

const parseEmployeePayload = (req) => {
  const payload = {
    ...req.body,
    monthlySalary: Number(req.body.monthlySalary),
  };

  if (!payload.dateOfBirth) {
    payload.dateOfBirth = null;
  }

  if (req.file) {
    payload.photoUrl = `/uploads/employees/${req.file.filename}`;
  }

  return payload;
};

const syncEmployeeAccount = async (employee, previousMobile = "") => {
  const username = String(employee.mobile || "").trim().toLowerCase();
  if (!username) return;

  let account = await User.findOne({ role: "employee", username });
  if (!account && previousMobile && previousMobile !== employee.mobile) {
    account = await User.findOne({ role: "employee", username: previousMobile.toLowerCase() });
  }

  if (account) {
    account.name = employee.employeeName;
    account.username = username;
    account.email = `${username}@employee.local`;
    await account.save();
    return;
  }

  await User.create({
    name: employee.employeeName,
    username,
    email: `${username}@employee.local`,
    password: employee.mobile,
    role: "employee",
  });
};

exports.createEmployee = async (req, res) => {
  try {
    const payload = parseEmployeePayload(req);

    const employee = await Employee.create(payload);
    await syncEmployeeAccount(employee);
    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEmployees = async (req, res) => {
  try {
    const { search = "", role = "", page = 1, limit = 12, all = "false" } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { employeeName: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role) query.role = role;

    const shouldReturnAll = String(all).toLowerCase() === "true";
    const pageNumber = Math.max(Number(page) || 1, 1);
    const pageSize = shouldReturnAll
      ? Math.min(Math.max(Number(limit) || 1000, 1), 5000)
      : Math.min(Math.max(Number(limit) || 12, 1), 100);
    const skip = (pageNumber - 1) * pageSize;

    const [employees, total] = await Promise.all([
      Employee.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
      Employee.countDocuments(query),
    ]);

    res.json({
      data: employees,
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

exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const existingEmployee = await Employee.findById(req.params.id);
    if (!existingEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const payload = parseEmployeePayload(req);

    const employee = await Employee.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    await syncEmployeeAccount(employee, existingEmployee.mobile);

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    await User.deleteMany({ role: "employee", username: String(employee.mobile || "").toLowerCase() });
    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
