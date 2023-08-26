import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

let itemsToBuy = [];
let itemsToBuy2 = [];
let user = "user1";

app.get("/", (req, res) => {
  user = "user1";
  res.render("index.ejs", { toBuy: itemsToBuy });
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
