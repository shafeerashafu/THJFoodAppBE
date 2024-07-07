const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  createOrder,
  getAllOrders,
  getSingleOrder,
  markOrderAsDelivered,
} = require("../controller/order");

router = express.Router();

router.post("/order", createOrder);
router.post("/getorders", protect, getAllOrders);
router.post("/getorder", protect, getSingleOrder);
router.post("/deliverd", protect, markOrderAsDelivered);

module.exports = router;
