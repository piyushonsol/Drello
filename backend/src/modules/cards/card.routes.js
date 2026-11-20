const express = require("express");
const authMiddleware = require("../../middleware/authMiddleware");
const cardController = require("./card.controller");

const router = express.Router();

router.use(authMiddleware);
router.patch("/reorder", cardController.reorder);
router.post("/", cardController.create);
router.get("/list/:listId", cardController.findByList);
router.get("/:id", cardController.findById);
router.put("/:id", cardController.update);
router.delete("/:id", cardController.remove);

module.exports = router;
