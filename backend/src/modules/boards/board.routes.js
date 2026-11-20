const express = require("express");
const authMiddleware = require("../../middleware/authMiddleware");
const boardController = require("./board.controller");

const router = express.Router();

router.use(authMiddleware);
router.post("/", boardController.create);
router.get("/", boardController.findAll);
router.get("/:id", boardController.findById);
router.put("/:id", boardController.update);
router.delete("/:id", boardController.remove);

module.exports = router;
