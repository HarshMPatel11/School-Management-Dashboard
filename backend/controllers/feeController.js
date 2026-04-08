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
    const { status = "" } = req.query;
    const query = {};
    if (status) query.paymentStatus = status;

    const fees = await Fee.find(query)
      .populate("student")
      .sort({ createdAt: -1 });

    res.json(fees);
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
