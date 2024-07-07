const express = require("express");
const {
  registerController,
  authConroller,
  loginController,
  verifyOtpController,
  updateUserProfile,
} = require("../controller/user");
const protect = require("../middleware/authMiddleware");

router = express.Router();

router.post("/register", registerController);
router.post("/get-user", protect, authConroller);
router.post("/login", loginController);
router.post("/verifyotp", verifyOtpController);
router.put("/update", protect, updateUserProfile);
module.exports = router;
