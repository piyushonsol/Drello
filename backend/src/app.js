const express = require("express");
const cors = require("cors");

const authRoutes = require("./modules/auth/auth.routes");
const boardRoutes = require("./modules/boards/board.routes");
const listRoutes = require("./modules/lists/list.routes");
const cardRoutes = require("./modules/cards/card.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/lists", listRoutes);
app.use("/api/cards", cardRoutes);

module.exports = app;
