import express from "express";
import bodyParser from "body-parser";
import mongoose, { model } from "mongoose";
import dotenv from "dotenv";
import ejs from "ejs";

const app = express();
const port = 3000;

dotenv.config();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

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
  checkbox: { type: Boolean, default: false },
  name: { type: String, required: true },
  quantity: { type: Number, min: 1 },
  price: {
    type: Number,
  },
});

const Item = new mongoose.model("Item", itemSchema);

const item1 = new Item({
  checkbox: false,
  name: "Bread",
  quantity: 2,
  price: 89,
});
const item2 = new Item({
  checkbox: false,
  name: "Milk",
  quantity: 1,
  price: 900,
});
const item3 = new Item({
  checkbox: true,
  name: "Chips",
  quantity: 4,
  price: 14,
});

const defaultItems = [item1, item2, item3];

//an async function to add item/s
const addItems = async (items) => {
  try {
    await Item.insertMany(items);
    console.log("Item/s added successfully");
  } catch (error) {
    console.error("Error adding default items:", error);
  }
};
//an async function to clear items
const clearList = async () => {
  try {
    await Item.deleteMany();
    console.log("List Cleared");
  } catch (error) {
    console.error("Error adding default items:", error);
    res.status(500).send("Error clearing the list");
  }
};

app.get("/", async (req, res) => {
  try {
    let foundItems = await Item.find({});
    if (foundItems.length === 0) {
      addItems(defaultItems);
      res.redirect("/");
    } else {
      res.render("index.ejs", { toBuy: foundItems });
    }
  } catch (err) {
    console.log("Error viewing the items", err);
    res.status(500).send("Error viewing items");
  }
});

app.post("/submit", (req, res) => {
  const newItem = new Item({
    checkbox: req.body["checkbox"],
    name: req.body["product"],
    quantity: req.body["quantity"] ? req.body["quantity"] : 1,
    price: req.body["price"] ? req.body["price"] : 0,
  });
  addItems(newItem);
  res.redirect("/");
});

app.post("/clear", (req, res) => {
  clearList();
  res.redirect("/");
});

//  ================= im here
app.post("/status", async (req, res) => {
  try {
    const checkedItemId = req.body["checkbox"];

    // Retrieve the current item from the database
    const currentItem = await Item.findById(checkedItemId);

    if (!currentItem) {
      console.error("Item not found.");
      return res.status(404).send("Item not found.");
    }

    // Toggle the checkbox value
    currentItem.checkbox = !currentItem.checkbox;

    // Save the updated item
    const updatedItem = await currentItem.save();

    res.redirect("/");
    console.log("Item updated:", updatedItem);
  } catch (error) {
    console.error("Error updating the checkbox:", error);
    res.status(500).send("Error updating the checkbox.");
  }
});

app.get("/user2", (req, res) => {
  user = "user2";
  res.render("index.ejs", { toBuy: itemsToBuy2 });
});

app.listen(port, () => {
  console.log(`App server running on port ${port}`);
});
