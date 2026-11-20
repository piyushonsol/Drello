const listService = require("./list.service");

function handleError(res, error, fallback) {
  return res.status(error.statusCode || 500).json({
    message: error.statusCode ? error.message : fallback,
  });
}

async function create(req, res) {
  try {
    const list = await listService.create(
      req.userId,
      req.body.name,
      req.body.boardId,
    );
    return res.status(201).json({ message: "List created successfully", list });
  } catch (error) {
    return handleError(res, error, "Error creating list");
  }
}

async function findByBoard(req, res) {
  try {
    const lists = await listService.findByBoard(req.userId, req.params.boardId);
    return res.status(200).json({ lists });
  } catch (error) {
    return handleError(res, error, "Error fetching lists");
  }
}

async function findById(req, res) {
  try {
    const list = await listService.findById(req.userId, req.params.id);
    return res.status(200).json({ list });
  } catch (error) {
    return handleError(res, error, "Error fetching list");
  }
}

async function update(req, res) {
  try {
    const list = await listService.update(
      req.userId,
      req.params.id,
      req.body.name,
    );
    return res.status(200).json({ message: "List updated successfully", list });
  } catch (error) {
    return handleError(res, error, "Error updating list");
  }
}

async function remove(req, res) {
  try {
    await listService.remove(req.userId, req.params.id);
    return res.status(200).json({
      message: "List and its cards deleted successfully",
    });
  } catch (error) {
    return handleError(res, error, "Error deleting list");
  }
}

module.exports = { create, findByBoard, findById, update, remove };
