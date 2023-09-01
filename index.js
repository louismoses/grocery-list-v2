import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";

const app = express();
const port = 3000;

dotenv.config();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// let itemsToBuy = [];
// let itemsToBuy2 = [];
let user = "user1";

// connect to DB
/*
const startServer = () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("[⚡] connected to database sucessfully"))
    .catch((err) => console.log(err));
};

startServer(); */

mongoose.connect("mongodb://127.0.0.1:27017/groceryList", {
  useNewUrlParser: true,
});

const itemSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  price: Number,
});

const Item = new mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Bread",
  quantity: 2,
  price: 89,
});
const item2 = new Item({
  name: "Milk",
  quantity: 1,
  price: 900,
});
const item3 = new Item({
  name: "Chips",
  quantity: 4,
  price: 14,
});

const defaultItems = [item1, item2, item3];

// Define an async function to add items
const addItems = async () => {
  try {
    await Item.insertMany(defaultItems);
    console.log("Default items added successfully");
  } catch (error) {
    console.error("Error adding default items:", error);
  }
};

// addItems();

app.get("/", async (req, res) => {
  try {
    let foundItems = await Item.find({});
    res.render("index.ejs", { toBuy: foundItems });
  } catch (err) {
    console.log("Error viewing the items", err);
    res.status(500).send("Error viewing items");
  }
});

app.post("/submit", (req, res) => {
  const newItem = req.body["product"];

  if (user === "user1") {
    itemsToBuy.unshift(newItem);
    user = "user1";
    res.redirect("/");
  } else if (user === "user2") {
    user = "user2";
    itemsToBuy2.unshift(newItem);
    res.redirect("/user2");
  }
});

app.get("/clear", (req, res) => {
  if (user === "user1") {
    itemsToBuy = [];
    user = "user1";
    res.render("index.ejs", { toBuy: itemsToBuy });
    res.redirect("/");
  } else if (user === "user2") {
    user = "user2";
    itemsToBuy2 = [];
    res.render("index.ejs", { toBuy: itemsToBuy2 });
    res.redirect("/user2");
  }
});

app.get("/user2", (req, res) => {
  user = "user2";
  res.render("index.ejs", { toBuy: itemsToBuy2 });
});

app.listen(port, () => {
  console.log(`App server running on port ${port}`);
});
