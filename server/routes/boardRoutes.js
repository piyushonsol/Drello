const express = require("express");
const router = express.Router();

const Board = require("../models/Board");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, async (req, res) => {
  console.log(req.body);
  const name = req.body.name;
  const description = req.body.description;
  const owner = req.userId;

  const board = new Board({
    name,
    description,
    owner: req.owner,
  });
});

module.exports = router;
