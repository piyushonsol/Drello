const Board = require("./board.model");
const List = require("../lists/list.model");
const Card = require("../cards/card.model");

async function create(ownerId, name, description) {
  if (!name?.trim()) {
    const error = new Error("Board name is required");
    error.statusCode = 400;
    throw error;
  }
  return Board.create({ name: name.trim(), description, owner: ownerId });
}

function findAll(ownerId) {
  return Board.find({ owner: ownerId }).sort({ createdAt: -1 });
}

async function findById(ownerId, boardId) {
  const board = await Board.findOne({ _id: boardId, owner: ownerId });
  if (!board) {
    const error = new Error("Board not found");
    error.statusCode = 404;
    throw error;
  }
  return board;
}

async function update(ownerId, boardId, name, description) {
  const board = await findById(ownerId, boardId);
  if (name !== undefined) board.name = name;
  if (description !== undefined) board.description = description;
  await board.save();
  return board;
}

async function remove(ownerId, boardId) {
  const board = await Board.findOneAndDelete({ _id: boardId, owner: ownerId });
  if (!board) {
    const error = new Error("Board not found");
    error.statusCode = 404;
    throw error;
  }
  const lists = await List.find({ board: board._id }).select("_id");
  await Card.deleteMany({ list: { $in: lists.map((list) => list._id) } });
  await List.deleteMany({ board: board._id });
  return board;
}

module.exports = { create, findAll, findById, update, remove };
