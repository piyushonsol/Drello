const express = require("express");
const router = express.Router();

const Card = require("../models/Card");
const List = require("../models/List");
const Board = require("../models/Board");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, listId } = req.body;

    const list = await List.findById(listId);

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

    const lastCard = await Card.findOne({ list: listId }).sort({
      position: -1,
    });

    const card = new Card({
      title,
      description,
      list: listId,
      position: lastCard ? lastCard.position + 1 : 0,
    });

    await card.save();

    return res.status(201).json({
      message: "Card created successfully",
      card,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error creating card",
    });
  }
});

router.get("/list/:listId", authMiddleware, async (req, res) => {
  try {
    const list = await List.findById(req.params.listId);

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

    const cards = await Card.find({
      list: req.params.listId,
    });

    return res.status(200).json({
      cards,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching cards",
    });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({
        message: "Card not found",
      });
    }

    const list = await List.findById(card.list);

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
        message: "Card not found",
      });
    }

    return res.status(200).json({
      card,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching card",
    });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, description } = req.body;

    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({
        message: "Card not found",
      });
    }

    const list = await List.findById(card.list);

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
        message: "Card not found",
      });
    }

    card.title = title;
    card.description = description;

    await card.save();

    return res.status(200).json({
      message: "Card updated successfully",
      card,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating card",
    });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({
        message: "Card not found",
      });
    }

    const list = await List.findById(card.list);

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
        message: "Card not found",
      });
    }

    await Card.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: "Card deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting card",
    });
  }
});

module.exports = router;
