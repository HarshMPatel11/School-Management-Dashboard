const Salary = require("../models/Salary");

exports.createSalary = async (req, res) => {
  try {
    const { employee, month, totalSalary, bonus = 0, deduction = 0, paymentDate } = req.body;

    const total = Number(totalSalary);
    const bonusNum = Number(bonus);
    const deductionNum = Number(deduction);
    const netPaid = Math.max(total + bonusNum - deductionNum, 0);

    const salary = await Salary.create({
      employee,
      month,
      totalSalary: total,
      bonus: bonusNum,
      deduction: deductionNum,
      netPaid,
      paymentDate: paymentDate || new Date(),
    });

    const populated = await Salary.findById(salary._id).populate("employee");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSalaries = async (req, res) => {
  try {
    const {
      employee = "",
      month = "",
      page = 1,
      limit = 10,
      all = "false",
      search = "",
    } = req.query;

    const query = {};
    if (employee) query.employee = employee;
    if (month) query.month = month;

    const shouldReturnAll = String(all).toLowerCase() === "true";
    const shouldFilterBySearch = Boolean(String(search || "").trim());

    const pageNumber = Math.max(Number(page) || 1, 1);
    const pageSize = shouldReturnAll
      ? Math.min(Math.max(Number(limit) || 1000, 1), 5000)
      : Math.min(Math.max(Number(limit) || 10, 1), 100);

    const skip = (pageNumber - 1) * pageSize;

    const baseQuery = Salary.find(query).populate("employee").sort({ createdAt: -1 });

    const salaries = shouldReturnAll || shouldFilterBySearch
      ? await baseQuery
      : await baseQuery.skip(skip).limit(pageSize);

    const filtered = shouldFilterBySearch
      ? salaries.filter((salary) => {
          const employeeData = salary.employee || {};
          const q = String(search).toLowerCase();
          return [employeeData.employeeName, employeeData.mobile, employeeData.role, salary.month]
            .some((value) => String(value || "").toLowerCase().includes(q));
        })
      : salaries;

    const total = shouldFilterBySearch ? filtered.length : await Salary.countDocuments(query);
    const data = shouldReturnAll || shouldFilterBySearch ? filtered : filtered.slice(0, pageSize);

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

exports.updateSalary = async (req, res) => {
  try {
    const { employee, month, totalSalary, bonus = 0, deduction = 0, paymentDate } = req.body;

    const total = Number(totalSalary);
    const bonusNum = Number(bonus);
    const deductionNum = Number(deduction);
    const netPaid = Math.max(total + bonusNum - deductionNum, 0);

    const salary = await Salary.findByIdAndUpdate(
      req.params.id,
      {
        employee,
        month,
        totalSalary: total,
        bonus: bonusNum,
        deduction: deductionNum,
        netPaid,
        paymentDate: paymentDate || new Date(),
      },
      { new: true, runValidators: true }
    ).populate("employee");

    if (!salary) {
      return res.status(404).json({ message: "Salary record not found" });
    }

    res.json(salary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteSalary = async (req, res) => {
  try {
    const salary = await Salary.findByIdAndDelete(req.params.id);
    if (!salary) {
      return res.status(404).json({ message: "Salary record not found" });
    }

    res.json({ message: "Salary record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
