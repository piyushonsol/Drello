const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

const User = require("../models/user");

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

module.exports = router;
