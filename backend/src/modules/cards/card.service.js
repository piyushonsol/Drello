const mongoose = require("mongoose");
const Card = require("./card.model");
const List = require("../lists/list.model");
const Board = require("../boards/board.model");

async function ownedBoard(ownerId, boardId) {
  const board = await Board.findOne({ _id: boardId, owner: ownerId });
  if (!board) {
    const error = new Error("Board not found");
    error.statusCode = 404;
    throw error;
  }
  return board;
}

async function findOwnedCard(ownerId, cardId) {
  const card = await Card.findById(cardId);
  if (!card) {
    const error = new Error("Card not found");
    error.statusCode = 404;
    throw error;
  }

  const list = await List.findById(card.list);
  if (!list) {
    const error = new Error("List not found");
    error.statusCode = 404;
    throw error;
  }
  await ownedBoard(ownerId, list.board);
  return { card, list };
}

async function create(ownerId, title, description, listId) {
  if (!title?.trim()) {
    const error = new Error("Card title is required");
    error.statusCode = 400;
    throw error;
  }

  const list = await List.findById(listId);
  if (!list) {
    const error = new Error("List not found");
    error.statusCode = 404;
    throw error;
  }
  await ownedBoard(ownerId, list.board);

  const lastCard = await Card.findOne({ list: listId }).sort({ position: -1 });
  return Card.create({
    title: title.trim(),
    description,
    list: listId,
    position: lastCard ? lastCard.position + 1 : 0,
  });
}

async function findByList(ownerId, listId) {
  const list = await List.findById(listId);
  if (!list) {
    const error = new Error("List not found");
    error.statusCode = 404;
    throw error;
  }
  await ownedBoard(ownerId, list.board);
  return Card.find({ list: listId }).sort({ position: 1, _id: 1 });
}

async function findById(ownerId, cardId) {
  const { card } = await findOwnedCard(ownerId, cardId);
  return card;
}

async function update(ownerId, cardId, title, description) {
  if (!title?.trim()) {
    const error = new Error("Card title is required");
    error.statusCode = 400;
    throw error;
  }
  const { card } = await findOwnedCard(ownerId, cardId);
  card.title = title.trim();
  card.description = description;
  await card.save();
  return card;
}

async function remove(ownerId, cardId) {
  const { card, list } = await findOwnedCard(ownerId, cardId);
  await Card.findByIdAndDelete(card._id);

  const remainingCards = await Card.find({ list: list._id }).sort({
    position: 1,
    _id: 1,
  });
  if (remainingCards.length > 0) {
    await Card.bulkWrite(
      remainingCards.map((remainingCard, position) => ({
        updateOne: {
          filter: { _id: remainingCard._id },
          update: { $set: { position } },
        },
      })),
    );
  }
}

async function reorder(ownerId, boardId, cards) {
  if (
    !mongoose.Types.ObjectId.isValid(boardId) ||
    !Array.isArray(cards) ||
    cards.length === 0
  ) {
    const error = new Error("Invalid board or cards data");
    error.statusCode = 400;
    throw error;
  }

  await ownedBoard(ownerId, boardId);
  const lists = await List.find({ board: boardId }).select("_id");
  const listIds = new Set(lists.map((list) => list._id.toString()));
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
      const error = new Error("Invalid card, list, or position data");
      error.statusCode = 400;
      throw error;
    }
    seenCardIds.add(card.cardId);
  }

  const boardCards = await Card.find({
    list: { $in: lists.map((list) => list._id) },
  }).select("_id");
  const boardCardIds = new Set(boardCards.map((card) => card._id.toString()));

  if (
    boardCardIds.size !== cards.length ||
    cards.some((card) => !boardCardIds.has(card.cardId))
  ) {
    const error = new Error("Cards do not match the board");
    error.statusCode = 400;
    throw error;
  }

  await Card.bulkWrite(
    cards.map((card) => ({
      updateOne: {
        filter: { _id: card.cardId },
        update: { $set: { list: card.listId, position: card.position } },
      },
    })),
  );
}

module.exports = { create, findByList, findById, update, remove, reorder };
