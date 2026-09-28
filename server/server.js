const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello i am ready");
});

app.listen(3000, () => {
  console.log("app is running ");
});
