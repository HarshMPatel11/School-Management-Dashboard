const express = require("express");
const router = express.Router();
const { login, register, getMe, createStaff, syncRoleAccounts } = require("../controllers/authController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/login", login);
router.post("/register", register);
router.get("/me", protect, getMe);
router.post("/users", protect, authorizeRoles("admin"), createStaff);
router.post("/sync-role-accounts", protect, authorizeRoles("admin"), syncRoleAccounts);

module.exports = router;
