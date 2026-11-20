const express = require("express");
const authMiddleware = require("../../middleware/authMiddleware");
const authController = require("./auth.controller");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/protected", authMiddleware, authController.protectedProfile);

module.exports = router;
