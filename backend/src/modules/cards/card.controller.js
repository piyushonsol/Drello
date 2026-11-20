const cardService = require("./card.service");

function handleError(res, error, fallback) {
  return res.status(error.statusCode || 500).json({
    message: error.statusCode ? error.message : fallback,
  });
}

async function create(req, res) {
  try {
    const card = await cardService.create(
      req.userId,
      req.body.title,
      req.body.description,
      req.body.listId,
    );
    return res.status(201).json({ message: "Card created successfully", card });
  } catch (error) {
    return handleError(res, error, "Error creating card");
  }
}

async function findByList(req, res) {
  try {
    const cards = await cardService.findByList(req.userId, req.params.listId);
    return res.status(200).json({ cards });
  } catch (error) {
    return handleError(res, error, "Error fetching cards");
  }
}

async function findById(req, res) {
  try {
    const card = await cardService.findById(req.userId, req.params.id);
    return res.status(200).json({ card });
  } catch (error) {
    return handleError(res, error, "Error fetching card");
  }
}

async function update(req, res) {
  try {
    const card = await cardService.update(
      req.userId,
      req.params.id,
      req.body.title,
      req.body.description,
    );
    return res.status(200).json({ message: "Card updated successfully", card });
  } catch (error) {
    return handleError(res, error, "Error updating card");
  }
}

async function remove(req, res) {
  try {
    await cardService.remove(req.userId, req.params.id);
    return res.status(200).json({ message: "Card deleted successfully" });
  } catch (error) {
    return handleError(res, error, "Error deleting card");
  }
}

async function reorder(req, res) {
  try {
    await cardService.reorder(req.userId, req.body.boardId, req.body.cards);
    return res.status(200).json({ message: "Card order saved successfully" });
  } catch (error) {
    return handleError(res, error, "Failed to save card order");
  }
}

module.exports = { create, findByList, findById, update, remove, reorder };
