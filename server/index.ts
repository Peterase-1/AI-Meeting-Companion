import express from "express";

const app = express();
const port = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI Meeting Companion Server is running!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
