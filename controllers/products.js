const Product = require("../models/product");

// GET all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ id: 1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get products",
      error: error.message,
    });
  }
};

// GET product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      id: Number(req.params.id),
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get product",
      error: error.message,
    });
  }
};

// CREATE product
const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// UPDATE product
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { id: Number(req.params.id) },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// DELETE product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      id: Number(req.params.id),
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};