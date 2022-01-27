const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const formatsLogger = app.get("env") === "development" ? "dev" : "short";

require("dotenv").config();
const PUBLIC_STORAGE = process.env.PUBLIC_STORAGE;

app.set("views", "./views");
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());
// ===========================
// or // app.use(express.static(path.join(__dirname, "public")));
// or // app.use(express.static("./public"));
// ===========================
app.use(express.static(path.join(__dirname, PUBLIC_STORAGE)));

require("./config/config-passport");

const contactsRouter = require("./routes/api/contacts");
const authRouter = require("./routes/api/auth");
app.use("/api/contacts/", contactsRouter);
app.use("/api/users/", authRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

module.exports = app;
