const fs = require("fs").promises;
const path = require("path");

const productsPath = path.join(
  process.cwd(),
  "data",
  "products.json"
);

// Get all products
const getProducts = async (req, res) => {
  try {
    const data = await fs.readFile(
      productsPath,
      "utf-8"
    );

    const products = JSON.parse(data);

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get products",
      error: error.message,
    });
  }
};

// Get single product
const getProductById = async (req, res) => {
  try {
    const data = await fs.readFile(
      productsPath,
      "utf-8"
    );

    const products = JSON.parse(data);

    const product = products.find(
      (item) => item.id === Number(req.params.id)
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get product",
      error: error.message,
    });
  }
};

// Add product
const createProduct = async (req, res) => {
  try {
    const data = await fs.readFile(
      productsPath,
      "utf-8"
    );

    const products = JSON.parse(data);

    const {
      name,
      category,
      price,
      oldPrice,
      discount,
      rating,
      image,
      sizes,
      colors,
    } = req.body;

    if (!name || !category || !price || !image) {
      return res.status(400).json({
        message:
          "Name, category, price and image are required",
      });
    }

    const newProduct = {
      id:
        products.length > 0
          ? Math.max(
              ...products.map((product) => product.id)
            ) + 1
          : 1,

      name,
      category,
      price: Number(price),

      oldPrice: oldPrice
        ? Number(oldPrice)
        : null,

      discount: discount
        ? Number(discount)
        : 0,

      rating: rating
        ? Number(rating)
        : 0,

      image,

      sizes: sizes || [],

      colors: colors || [],
    };

    products.push(newProduct);

    await fs.writeFile(
      productsPath,
      JSON.stringify(products, null, 2)
    );

    res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const data = await fs.readFile(
      productsPath,
      "utf-8"
    );

    const products = JSON.parse(data);

    const productIndex = products.findIndex(
      (item) => item.id === Number(req.params.id)
    );

    if (productIndex === -1) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    products[productIndex] = {
      ...products[productIndex],
      ...req.body,
      id: products[productIndex].id,
    };

    await fs.writeFile(
      productsPath,
      JSON.stringify(products, null, 2)
    );

    res.status(200).json({
      message: "Product updated successfully",
      product: products[productIndex],
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const data = await fs.readFile(
      productsPath,
      "utf-8"
    );

    const products = JSON.parse(data);

    const productIndex = products.findIndex(
      (item) => item.id === Number(req.params.id)
    );

    if (productIndex === -1) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const deletedProduct =
      products[productIndex];

    products.splice(productIndex, 1);

    await fs.writeFile(
      productsPath,
      JSON.stringify(products, null, 2)
    );

    res.status(200).json({
      message: "Product deleted successfully",
      product: deletedProduct,
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