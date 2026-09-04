const express = require("express");

const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
} = require("../controllers/orders");

const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Create order
router.post("/", authMiddleware, createOrder);

// Get logged-in user's orders
router.get("/", authMiddleware, getMyOrders);

// Get single order
router.get("/:id", authMiddleware, getOrderById);

// Cancel order
router.put("/:id/cancel", authMiddleware, cancelOrder);

module.exports = router;