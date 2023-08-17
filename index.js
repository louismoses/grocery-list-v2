import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

let itemsToBuy = [];

app.get("/", (req, res) => {
  res.render("index.ejs");
});
app.post("/submit", (req, res) => {
  const newItem = req.body["product"];
  itemsToBuy.push(newItem);

  res.render("index.ejs", { toBuy: itemsToBuy });
});

app.listen(port, () => {
  console.log(`App server running on port ${port}`);
});
