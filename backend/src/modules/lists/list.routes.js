const express = require("express");
const authMiddleware = require("../../middleware/authMiddleware");
const listController = require("./list.controller");

const router = express.Router();

router.use(authMiddleware);
router.post("/", listController.create);
router.get("/board/:boardId", listController.findByBoard);
router.get("/:id", listController.findById);
router.put("/:id", listController.update);
router.delete("/:id", listController.remove);

module.exports = router;
