import express from "express";
import bodyParser from "body-parser";
import mongoose, { model } from "mongoose";
import dotenv from "dotenv";
import _ from "lodash";

const app = express();
const port = 3000;

dotenv.config();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// connect to DB

const startServer = () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("[⚡] connected to database sucessfully"))
    .catch((err) => console.log(err));
};

startServer();

// mongoose.connect("mongodb://127.0.0.1:27017/groceryList", {
//   useNewUrlParser: true,
// });

// SCHEMA
// ->for grocery list
const itemsSchema = new mongoose.Schema({
  checkbox: { type: Boolean, default: false },
  name: { type: String, required: true },
  quantity: { type: Number, min: 1 },
  price: {
    type: Number,
  },
});

// ->for user list
const userSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});

// MODEL
const Item = new mongoose.model("Item", itemsSchema);
const User = mongoose.model("User", userSchema);

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

// ROUTE
// default
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

// add new item
app.post("/submit", async (req, res) => {
  const userName = req.body.currentUser;
  const addUserItem = await User.findOne({ name: userName });

  const newItem = new Item({
    checkbox: req.body["checkbox"],
    name: req.body["product"],
    quantity: req.body["quantity"] ? req.body["quantity"] : 1,
    price: req.body["price"] ? req.body["price"] : 0,
  });
  if (!userName) {
    addItems(newItem);
    res.redirect("/");
  } else {
    addUserItem.items.push(newItem);
    await addUserItem.save();
    res.redirect("/" + userName);
  }
});

// clear items
app.post("/clear", async (req, res) => {
  const user = req.body.user;
  const clearUserItems = await User.findOne({ name: user });
  if (!user) {
    clearList();
    res.redirect("/");
  } else {
    clearUserItems.items = defaultItems;
    await clearUserItems.save();
    res.redirect("/" + user);
  }
});

// checkbox status
app.post("/status", async (req, res) => {
  try {
    const checkedItemId = req.body["checkbox"];
    const user = req.body.user;
    const currentItem = await Item.findById(checkedItemId);
    const checkBoxStatus = req.body.checkBoxStatus;

    if (!user) {
      if (!currentItem) {
        console.error("Item not found.");
        return res.status(404).send("Item not found..");
      }

      // Toggle the checkbox value
      currentItem.checkbox = !currentItem.checkbox;

      // Save the updated item
      const updatedItem = await currentItem.save();
      res.redirect("/");
      console.log("Item updated:", updatedItem);
    } else {
      if (checkBoxStatus === "true") {
        await User.updateMany(
          { "items._id": checkedItemId },
          {
            $set: {
              "items.$.checkbox": false,
            },
          }
        );
        res.redirect("/" + user);
      }
      if (checkBoxStatus === "false") {
        await User.updateMany(
          { "items._id": checkedItemId },
          {
            $set: {
              "items.$.checkbox": true,
            },
          }
        );
        res.redirect("/" + user);
      }
    }
  } catch (error) {
    console.error("Error updating the checkbox:", error);
    res.status(500).send("Error updating the checkbox.");
  }
});

// add new item on user list route
app.get("/:user", async (req, res) => {
  const user = _.capitalize(req.params.user);
  const currentUser = await User.findOne({ name: user });

  if (!currentUser) {
    const userList = new User({
      name: user,
      items: defaultItems,
    });
    await userList.save();
    res.redirect("/" + user);
  } else {
    res.render("index.ejs", {
      toBuy: currentUser.items,
      userName: currentUser.name,
    });
  }
});

// RUNNING SERVER
app.listen(port, () => {
  console.log(`App server running on port ${port}`);
});
