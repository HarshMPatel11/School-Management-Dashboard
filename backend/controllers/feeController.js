const Fee = require("../models/Fee");

const getPaymentStatus = (totalFee, paidFee) => {
  if (paidFee <= 0) return "Unpaid";
  if (paidFee < totalFee) return "Partial";
  return "Paid";
};

exports.createFee = async (req, res) => {
  try {
    const { student, month, totalFee, paidFee } = req.body;
    const dueFee = Number(totalFee) - Number(paidFee);
    const paymentStatus = getPaymentStatus(Number(totalFee), Number(paidFee));

    const fee = await Fee.create({
      student,
      month,
      totalFee: Number(totalFee),
      paidFee: Number(paidFee),
      dueFee,
      paymentStatus,
    });

    res.status(201).json(fee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFees = async (req, res) => {
  try {
    const {
      status = "",
      student = "",
      month = "",
      page = 1,
      limit = 10,
      all = "false",
      search = "",
    } = req.query;
    const query = {};
    if (status) query.paymentStatus = status;
    if (student) query.student = student;
    if (month) query.month = month;

    const shouldReturnAll = String(all).toLowerCase() === "true";
    const shouldFilterBySearch = Boolean(String(search || "").trim());
    const pageNumber = Math.max(Number(page) || 1, 1);
    const pageSize = shouldReturnAll
      ? Math.min(Math.max(Number(limit) || 1000, 1), 5000)
      : Math.min(Math.max(Number(limit) || 10, 1), 100);
    const skip = (pageNumber - 1) * pageSize;

    const baseQuery = Fee.find(query)
      .populate("student")
      .sort({ createdAt: -1 });

    const fees = shouldReturnAll || shouldFilterBySearch
      ? await baseQuery
      : await baseQuery.skip(skip).limit(pageSize);

    const filteredBySearch = shouldFilterBySearch
      ? fees.filter((fee) => {
          const studentData = fee.student || {};
          const q = String(search).toLowerCase();
          return [studentData.fullName, studentData.rollNumber, studentData.className, fee.month]
            .some((value) => String(value || "").toLowerCase().includes(q));
        })
      : fees;

    const total = shouldFilterBySearch ? filteredBySearch.length : await Fee.countDocuments(query);
    const paged = shouldReturnAll || shouldFilterBySearch
      ? filteredBySearch
      : filteredBySearch.slice(0, pageSize);

    res.json({
      data: paged,
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

exports.updateFee = async (req, res) => {
  try {
    const { month, totalFee, paidFee, student } = req.body;
    const dueFee = Number(totalFee) - Number(paidFee);
    const paymentStatus = getPaymentStatus(Number(totalFee), Number(paidFee));

    const fee = await Fee.findByIdAndUpdate(
      req.params.id,
      {
        student,
        month,
        totalFee: Number(totalFee),
        paidFee: Number(paidFee),
        dueFee,
        paymentStatus,
      },
      { new: true, runValidators: true }
    );

    if (!fee) {
      return res.status(404).json({ message: "Fee record not found" });
    }

    res.json(fee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteFee = async (req, res) => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id);
    if (!fee) {
      return res.status(404).json({ message: "Fee record not found" });
    }
    res.json({ message: "Fee record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
