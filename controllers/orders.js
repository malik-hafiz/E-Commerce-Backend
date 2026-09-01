const fs = require("fs").promises;
const path = require("path");

const ordersPath = path.join(
  process.cwd(),
  "data",
  "orders.json"
);

const productsPath = path.join(
  process.cwd(),
  "data",
  "products.json"
);

// Create Order
const createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
    } = req.body;

    // Basic validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        message: "Shipping address is required",
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        message: "Payment method is required",
      });
    }

    // Read products
    const productsData = await fs.readFile(
      productsPath,
      "utf8"
    );

    const products = JSON.parse(productsData);

    let totalAmount = 0;
    const orderItems = [];

    // Validate products and calculate total
    for (const item of items) {
      const product = products.find(
        (p) => p.id === Number(item.productId)
      );

      if (!product) {
        return res.status(400).json({
          message: `Product ${item.productId} not found`,
        });
      }

      const quantity = Number(item.quantity);

      if (!quantity || quantity < 1) {
        return res.status(400).json({
          message: "Invalid quantity",
        });
      }

      const itemTotal = product.price * quantity;

      totalAmount += itemTotal;

      orderItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity,
        size: item.size || null,
        color: item.color || null,
      });
    }

    // Read orders
    const ordersData = await fs.readFile(
      ordersPath,
      "utf8"
    );

    const orders = JSON.parse(ordersData);

    const newOrder = {
      id:
        orders.length > 0
          ? Math.max(...orders.map((order) => order.id)) + 1
          : 1,

      userId: req.user.id,

      items: orderItems,

      totalAmount,

      shippingAddress,

      paymentMethod,

      status: "Pending",

      createdAt: new Date().toISOString(),
    };

    orders.push(newOrder);

    await fs.writeFile(
      ordersPath,
      JSON.stringify(orders, null, 2)
    );

    res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create order",
    });
  }
};

// Get logged-in user's orders
const getMyOrders = async (req, res) => {
  try {
    const data = await fs.readFile(
      ordersPath,
      "utf8"
    );

    const orders = JSON.parse(data);

    const userOrders = orders.filter(
      (order) => order.userId === req.user.id
    );

    res.status(200).json(userOrders);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to get orders",
    });
  }
};

// Get single user's order
const getOrderById = async (req, res) => {
  try {
    const data = await fs.readFile(
      ordersPath,
      "utf8"
    );

    const orders = JSON.parse(data);

    const order = orders.find(
      (item) =>
        item.id === Number(req.params.id) &&
        item.userId === req.user.id
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to get order",
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
};