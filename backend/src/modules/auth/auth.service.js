const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./auth.model");

async function register(username, email, password) {
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (existingUser) {
    const error = new Error("User already exists");
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ username, email, password: hashedPassword });
}

async function login(username, email, password) {
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 400;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    const error = new Error("Invalid credentials");
    error.statusCode = 400;
    throw error;
  }

  return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
}

module.exports = { register, login };
