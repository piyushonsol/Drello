const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    list: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "List",
      required: true,
    },

    position: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

const Card = mongoose.model("Card", cardSchema);

module.exports = Card;
