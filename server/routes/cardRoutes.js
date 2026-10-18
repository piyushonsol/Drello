const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
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

router.patch("/reorder", authMiddleware, async (req, res) => {
  try {
    const { boardId, cards } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(boardId) ||
      !Array.isArray(cards) ||
      cards.length === 0
    ) {
      return res.status(400).json({
        message: "Invalid board or cards data",
      });
    }

    // Verify that this board belongs to the logged-in user.
    const board = await Board.findOne({
      _id: boardId,
      owner: req.userId,
    });

    if (!board) {
      return res.status(404).json({
        message: "Board not found",
      });
    }

    // Get every list belonging to this board.
    const lists = await List.find({ board: boardId }).select("_id");

    const listIds = new Set(lists.map((list) => list._id.toString()));

    // Validate every card and destination list.
    const seenCardIds = new Set();

    for (const card of cards) {
      if (
        !mongoose.Types.ObjectId.isValid(card.cardId) ||
        !mongoose.Types.ObjectId.isValid(card.listId) ||
        !listIds.has(card.listId) ||
        !Number.isInteger(card.position) ||
        card.position < 0 ||
        seenCardIds.has(card.cardId)
      ) {
        return res.status(400).json({
          message: "Invalid card, list, or position data",
        });
      }

      seenCardIds.add(card.cardId);
    }

    // Verify that all submitted cards actually belong
    // to this board, rather than another user's board.
    const boardCards = await Card.find({
      list: { $in: lists.map((list) => list._id) },
    }).select("_id");

    const boardCardIds = new Set(boardCards.map((card) => card._id.toString()));

    if (
      boardCardIds.size !== cards.length ||
      cards.some((card) => !boardCardIds.has(card.cardId))
    ) {
      return res.status(400).json({
        message: "Cards do not match the board",
      });
    }

    // Save each card's destination list and new position.
    const operations = cards.map((card) => ({
      updateOne: {
        filter: { _id: card.cardId },
        update: {
          $set: {
            list: card.listId,
            position: card.position,
          },
        },
      },
    }));

    await Card.bulkWrite(operations);

    return res.status(200).json({
      message: "Card order saved successfully",
    });
  } catch (error) {
    console.error("Reorder cards error:", error);

    return res.status(500).json({
      message: "Failed to save card order",
    });
  }
});

module.exports = router;
