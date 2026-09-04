const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");


// =========================
// SIGNUP
// =========================

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Create JWT
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    res.status(201).json({
      message: "Signup successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    res.status(500).json({
      message: "Signup failed",
      error: error.message,
    });
  }
};


// =========================
// LOGIN
// =========================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Create token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    res.json({
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};


// =========================
// GET CURRENT USER
// =========================

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      user,
    });
  } catch (error) {
    console.error("Get user error:", error);

    res.status(500).json({
      message: "Failed to get user",
      error: error.message,
    });
  }
};


module.exports = {
  signup,
  login,
  getMe,
};