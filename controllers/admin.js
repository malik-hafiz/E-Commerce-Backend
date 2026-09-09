const bcrypt = require("bcrypt");
const User = require("../models/user");
const Order = require("../models/order");

// =========================
// DASHBOARD
// =========================

const getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCustomers = totalUsers;

    const totalOrders = await Order.countDocuments();

    const revenueResult = await Order.aggregate([
      {
        $match: {
          status: { $ne: "Cancelled" },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalRevenue =
      revenueResult.length > 0
        ? revenueResult[0].totalRevenue
        : 0;

    const recentOrders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalUsers,
      totalCustomers,
      totalOrders,
      totalRevenue,
      recentOrders,
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      message: "Failed to get dashboard data",
      error: error.message,
    });
  }
};

// =========================
// USERS - GET ALL
// =========================

const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      message: "Failed to get users",
      error: error.message,
    });
  }
};

// =========================
// USERS - CREATE
// =========================

const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);

    res.status(500).json({
      message: "Failed to create user",
      error: error.message,
    });
  }
};

// =========================
// USERS - UPDATE
// =========================

const updateUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (name) user.name = name;

    if (email) {
      user.email = email.toLowerCase();
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.json({
      message: "User updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);

    res.status(500).json({
      message: "Failed to update user",
      error: error.message,
    });
  }
};

// =========================
// USERS - DELETE
// =========================

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    res.status(500).json({
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

// =========================
// CUSTOMERS - GET ALL
// =========================

const getCustomers = async (req, res) => {
  try {
    const customers = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    const customersWithOrders = await Promise.all(
      customers.map(async (customer) => {
        const orders = await Order.find({
          userId: customer._id,
        });

        const totalSpent = orders.reduce(
          (total, order) => {
            if (order.status !== "Cancelled") {
              return total + order.totalAmount;
            }

            return total;
          },
          0
        );

        return {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          createdAt: customer.createdAt,
          totalOrders: orders.length,
          totalSpent,
        };
      })
    );

    res.json({
      customers: customersWithOrders,
    });
  } catch (error) {
    console.error("Get customers error:", error);

    res.status(500).json({
      message: "Failed to get customers",
      error: error.message,
    });
  }
};

// =========================
// CUSTOMERS - CREATE
// =========================

const createCustomer = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingCustomer = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingCustomer) {
      return res.status(409).json({
        message: "Customer already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Customer created successfully",
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
      },
    });
  } catch (error) {
    console.error("Create customer error:", error);

    res.status(500).json({
      message: "Failed to create customer",
      error: error.message,
    });
  }
};

// =========================
// CUSTOMERS - UPDATE
// =========================

const updateCustomer = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const customer = await User.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    if (name) customer.name = name;

    if (email) {
      customer.email = email.toLowerCase();
    }

    if (password) {
      customer.password = await bcrypt.hash(password, 10);
    }

    await customer.save();

    res.json({
      message: "Customer updated successfully",
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
      },
    });
  } catch (error) {
    console.error("Update customer error:", error);

    res.status(500).json({
      message: "Failed to update customer",
      error: error.message,
    });
  }
};

// =========================
// CUSTOMERS - DELETE
// =========================

const deleteCustomer = async (req, res) => {
  try {
    const customer = await User.findByIdAndDelete(
      req.params.id
    );

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    // Delete customer's orders as well
    await Order.deleteMany({
      userId: customer._id,
    });

    res.json({
      message: "Customer and their orders deleted successfully",
    });
  } catch (error) {
    console.error("Delete customer error:", error);

    res.status(500).json({
      message: "Failed to delete customer",
      error: error.message,
    });
  }
};

// =========================
// ORDERS - GET ALL
// =========================

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      orders,
    });
  } catch (error) {
    console.error("Get admin orders error:", error);

    res.status(500).json({
      message: "Failed to get orders",
      error: error.message,
    });
  }
};

// =========================
// ORDERS - GET ONE
// =========================

const getAdminOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "name email");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json({
      order,
    });
  } catch (error) {
    console.error("Get admin order error:", error);

    res.status(500).json({
      message: "Failed to get order",
      error: error.message,
    });
  }
};

// =========================
// ORDERS - CREATE
// =========================

const createAdminOrder = async (req, res) => {
  try {
    const {
      userId,
      items,
      totalAmount,
      shippingAddress,
      status,
    } = req.body;

    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "User ID and order items are required",
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        message: "Shipping address is required",
      });
    }

    const order = await Order.create({
      userId,
      items,
      totalAmount,
      shippingAddress,
      status: status || "Pending",
    });

    const populatedOrder = await Order.findById(order._id)
      .populate("userId", "name email");

    res.status(201).json({
      message: "Order created successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Create admin order error:", error);

    res.status(500).json({
      message: "Failed to create order",
      error: error.message,
    });
  }
};

// =========================
// ORDERS - UPDATE
// =========================

const updateAdminOrder = async (req, res) => {
  try {
    const {
      items,
      totalAmount,
      shippingAddress,
      status,
    } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (items) order.items = items;

    if (totalAmount !== undefined) {
      order.totalAmount = totalAmount;
    }

    if (shippingAddress) {
      order.shippingAddress = shippingAddress;
    }

    if (status) {
      order.status = status;
    }

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate("userId", "name email");

    res.json({
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update admin order error:", error);

    res.status(500).json({
      message: "Failed to update order",
      error: error.message,
    });
  }
};

// =========================
// ORDERS - DELETE
// =========================

const deleteAdminOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Delete admin order error:", error);

    res.status(500).json({
      message: "Failed to delete order",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboard,

  getUsers,
  createUser,
  updateUser,
  deleteUser,

  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,

  getOrders,
  getAdminOrderById,
  createAdminOrder,
  updateAdminOrder,
  deleteAdminOrder,
};