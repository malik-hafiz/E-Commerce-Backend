require("dotenv").config();

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const Product = require("./models/product");


// =========================
// CONNECT TO MONGODB
// =========================

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    // JSON file path
    const filePath = path.join(
      __dirname,
      "data",
      "products.json"
    );

    // Read JSON file
    const data = fs.readFileSync(
      filePath,
      "utf-8"
    );

    const products = JSON.parse(data);

    console.log(
      `${products.length} products found in JSON`
    );

    // Remove existing products
    await Product.deleteMany({});

    console.log("Old products deleted");

    // Insert products
    await Product.insertMany(products);

    console.log(
      `${products.length} products inserted into MongoDB`
    );

    // Close connection
    await mongoose.connection.close();

    console.log("MongoDB connection closed");

    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);

    await mongoose.connection.close();

    process.exit(1);
  }
};


seedProducts();