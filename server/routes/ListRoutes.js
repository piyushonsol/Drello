const express = require("express");
const router = express.Router();

const List = require("../models/List");
const Board = require("../models/Board");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, boardId } = req.body;

    const board = await Board.findOne({
      _id: boardId,
      owner: req.userId,
    });

    if (!board) {
      return res.status(404).json({
        message: "Board not found",
      });
    }

    const list = new List({
      name,
      board: boardId,
    });

    await list.save();

    return res.status(201).json({
      message: "List created successfully",
      list,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error creating list",
    });
  }
});

router.get("/board/:boardId", authMiddleware, async (req, res) => {
  try {
    const board = await Board.findOne({
      _id: req.params.boardId,
      owner: req.userId,
    });

    if (!board) {
      return res.status(404).json({
        message: "Board not found",
      });
    }

    const lists = await List.find({
      board: req.params.boardId,
    });

    return res.status(200).json({
      lists,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching lists",
    });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const list = await List.findById(req.params.id);

    if (!list) {
      return res.status(404).json({
        message: "List not found",
      });
    }

    const board = await Board.findOne({
      _id: list.board,
      owner: req.userId,
    });

    if (!board) {
      return res.status(404).json({
        message: "List not found",
      });
    }

    return res.status(200).json({
      list,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching list",
    });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;

    const list = await List.findById(req.params.id);

    if (!list) {
      return res.status(404).json({
        message: "List not found",
      });
    }

    const board = await Board.findOne({
      _id: list.board,
      owner: req.userId,
    });

    if (!board) {
      return res.status(404).json({
        message: "List not found",
      });
    }

    list.name = name;

    await list.save();

    return res.status(200).json({
      message: "List updated successfully",
      list,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating list",
    });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const list = await List.findById(req.params.id);

    if (!list) {
      return res.status(404).json({
        message: "List not found",
      });
    }

    const board = await Board.findOne({
      _id: list.board,
      owner: req.userId,
    });

    if (!board) {
      return res.status(404).json({
        message: "List not found",
      });
    }

    await List.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: "List deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting list",
    });
  }
});

module.exports = router;
