const Order = require("../models/order");


// =========================
// CREATE ORDER
// =========================

const createOrder = async (req, res) => {
  try {
    const {
      items,
      totalAmount,
      shippingAddress,
    } = req.body;

    // Check items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Order items are required",
      });
    }

    // Check shipping address
    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.phone
    ) {
      return res.status(400).json({
        message: "Complete shipping address is required",
      });
    }

    // Create order
    const order = await Order.create({
      userId: req.user.userId,

      items,

      totalAmount,

      shippingAddress,
    });

    res.status(201).json({
      message: "Order created successfully",

      order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    res.status(500).json({
      message: "Failed to create order",
      error: error.message,
    });
  }
};


// =========================
// GET MY ORDERS
// =========================

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.user.userId,
    }).sort({
      createdAt: -1,
    });

    res.json({
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    res.status(500).json({
      message: "Failed to get orders",
      error: error.message,
    });
  }
};


// =========================
// GET SINGLE ORDER
// =========================

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json({
      order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    res.status(500).json({
      message: "Failed to get order",
      error: error.message,
    });
  }
};


// =========================
// CANCEL ORDER
// =========================

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Don't cancel delivered order
    if (order.status === "Delivered") {
      return res.status(400).json({
        message: "Delivered order cannot be cancelled",
      });
    }

    order.status = "Cancelled";

    await order.save();

    res.json({
      message: "Order cancelled successfully",

      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);

    res.status(500).json({
      message: "Failed to cancel order",
      error: error.message,
    });
  }
};


module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
};