const mongoose = require("mongoose");

async function connectDatabase(uri) {
  if (!uri) {
    throw new Error("MONGO_URI is required");
  }
  await mongoose.connect(uri);
  console.log("MongoDB connected");
}

module.exports = { connectDatabase };
