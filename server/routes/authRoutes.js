const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");

const User = require("../models/User");

router.post("/register", async (req, res) => {
  console.log(req.body);
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  const registeredUser = await User.findOne({
    $or: [{ email: email }, { username: username }],
  });

  if (registeredUser) {
    return res.status(400).json({
      message: "User already exists",
    });
  }
  const Password = await bcrypt.hash(password, 10);
  User.create({ username, email, password: Password });

  res.json({
    message: "Register route working",
  });
});

router.post("/login", async (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  const user = await User.findOne({
    $or: [{ email: email }, { username: username }],
  });

  if (!user) {
    return res.status(400).json({
      message: "user not found",
    });
  } else {
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    return res.status(200).json({
      message: "Login successful",
      token: token,
    });
  }
});

router.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You are authenticated",
    userId: req.userId,
  });
});

module.exports = router;
