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
    owner: owner,
  });
  await board.save();
  return res.status(201).json({ message: "board created successfulyl", board });
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const boards = await Board.find({
      owner: req.userId,
    });

    return res.status(200).json({
      boards,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching boards",
    });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const board = await Board.findOne({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!board) {
      return res.status(404).json({
        message: "Board not found",
      });
    }

    return res.status(200).json({
      board,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching board",
    });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;

    const board = await Board.findOne({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!board) {
      return res.status(404).json({
        message: "Board not found",
      });
    }

    board.name = name;
    board.description = description;

    await board.save();

    return res.status(200).json({
      message: "Board updated successfully",
      board,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating board",
    });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const board = await Board.findOneAndDelete({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!board) {
      return res.status(404).json({
        message: "Board not found",
      });
    }

    return res.status(200).json({
      message: "Board deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting board",
    });
  }
});

module.exports = router;
