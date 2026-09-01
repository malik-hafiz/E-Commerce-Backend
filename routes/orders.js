const express = require("express");

const {
  createOrder,
  getMyOrders,
  getOrderById,
} = require("../controllers/orders");

const auth = require("../middlewares/auth");

const router = express.Router();

// Create order
router.post("/", auth, createOrder);

// Get logged-in user's orders
router.get("/my-orders", auth, getMyOrders);

// Get single order
router.get("/:id", auth, getOrderById);

module.exports = router;