const express = require("express");

const {
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
} = require("../controllers/admin");

const authMiddleware = require("../middlewares/auth");
const adminMiddleware = require("../middlewares/admin");

const router = express.Router();

// All admin routes require:
// 1. Login
// 2. Admin role

router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard
router.get("/dashboard", getDashboard);

// Users
router.get("/users", getUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Customers
router.get("/customers", getCustomers);
router.post("/customers", createCustomer);
router.put("/customers/:id", updateCustomer);
router.delete("/customers/:id", deleteCustomer);

// Orders
router.get("/orders", getOrders);
router.get("/orders/:id", getAdminOrderById);
router.post("/orders", createAdminOrder);
router.put("/orders/:id", updateAdminOrder);
router.delete("/orders/:id", deleteAdminOrder);

module.exports = router;