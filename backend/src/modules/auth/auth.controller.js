const authService = require("./auth.service");

async function register(req, res) {
  try {
    await authService.register(
      req.body.username,
      req.body.email,
      req.body.password,
    );
    return res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ message: error.statusCode ? error.message : "Registration failed" });
  }
}

async function login(req, res) {
  try {
    const token = await authService.login(
      req.body.username,
      req.body.email,
      req.body.password,
    );
    return res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ message: error.statusCode ? error.message : "Login failed" });
  }
}

function protectedProfile(req, res) {
  res.json({ message: "You are authenticated", userId: req.userId });
}

module.exports = { register, login, protectedProfile };
