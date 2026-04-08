const express = require("express");
const router = express.Router();
const {
  createFee,
  getFees,
  updateFee,
  deleteFee,
} = require("../controllers/feeController");

router.post("/", createFee);
router.get("/", getFees);
router.put("/:id", updateFee);
router.delete("/:id", deleteFee);

module.exports = router;
