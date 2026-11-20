require("dotenv").config();

const app = require("./app");
const { connectDatabase } = require("./config/database");

async function startServer() {
  await connectDatabase(process.env.MONGO_URI);

  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
