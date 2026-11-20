const List = require("./list.model");
const Board = require("../boards/board.model");
const Card = require("../cards/card.model");

async function ownedBoard(ownerId, boardId) {
  const board = await Board.findOne({ _id: boardId, owner: ownerId });
  if (!board) {
    const error = new Error("Board not found");
    error.statusCode = 404;
    throw error;
  }
  return board;
}

async function findOwnedList(ownerId, listId) {
  const list = await List.findById(listId);
  if (!list) {
    const error = new Error("List not found");
    error.statusCode = 404;
    throw error;
  }
  await ownedBoard(ownerId, list.board);
  return list;
}

async function create(ownerId, name, boardId) {
  if (!name?.trim()) {
    const error = new Error("List name is required");
    error.statusCode = 400;
    throw error;
  }
  await ownedBoard(ownerId, boardId);
  return List.create({ name: name.trim(), board: boardId });
}

async function findByBoard(ownerId, boardId) {
  await ownedBoard(ownerId, boardId);
  return List.find({ board: boardId }).sort({ createdAt: 1 });
}

async function findById(ownerId, listId) {
  return findOwnedList(ownerId, listId);
}

async function update(ownerId, listId, name) {
  if (!name?.trim()) {
    const error = new Error("List name is required");
    error.statusCode = 400;
    throw error;
  }
  const list = await findOwnedList(ownerId, listId);
  list.name = name.trim();
  await list.save();
  return list;
}

async function remove(ownerId, listId) {
  const list = await findOwnedList(ownerId, listId);
  await Card.deleteMany({ list: list._id });
  await List.findByIdAndDelete(list._id);
}

module.exports = { create, findByBoard, findById, update, remove };
