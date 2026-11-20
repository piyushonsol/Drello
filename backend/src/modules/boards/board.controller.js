const boardService = require("./board.service");

async function create(req, res) {
  try {
    const board = await boardService.create(
      req.userId,
      req.body.name,
      req.body.description,
    );
    return res.status(201).json({ message: "Board created successfully", board });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : "Error creating board",
    });
  }
}

async function findAll(req, res) {
  try {
    const boards = await boardService.findAll(req.userId);
    return res.status(200).json({ boards });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching boards" });
  }
}

async function findById(req, res) {
  try {
    const board = await boardService.findById(req.userId, req.params.id);
    return res.status(200).json({ board });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : "Error fetching board",
    });
  }
}

async function update(req, res) {
  try {
    const board = await boardService.update(
      req.userId,
      req.params.id,
      req.body.name,
      req.body.description,
    );
    return res.status(200).json({ message: "Board updated successfully", board });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : "Error updating board",
    });
  }
}

async function remove(req, res) {
  try {
    await boardService.remove(req.userId, req.params.id);
    return res.status(200).json({ message: "Board deleted successfully" });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : "Error deleting board",
    });
  }
}

module.exports = { create, findAll, findById, update, remove };
