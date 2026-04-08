const express = require("express");
const router = express.Router();
const { login, getMe, createStaff } = require("../controllers/authController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/users", protect, authorizeRoles("admin"), createStaff);

module.exports = router;
