const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  createFee,
  getFees,
  updateFee,
  deleteFee,
} = require("../controllers/feeController");

router.use(protect);

router.post("/", authorizeRoles("admin", "employee"), createFee);
router.get("/", authorizeRoles("admin", "employee"), getFees);
router.put("/:id", authorizeRoles("admin", "employee"), updateFee);
router.delete("/:id", authorizeRoles("admin"), deleteFee);

module.exports = router;
