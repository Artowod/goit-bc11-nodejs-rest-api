const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
// const jwt = require("jsonwebtoken");

/* ===============JWT coding - decoding=============== */
// const payload = { id: 12345, username: "Serg" };
// const secret = "secretum1";
// const token = jwt.sign(payload, secret);
// console.log("User token: ", token);

// const decodeToken = jwt.decode(token);
// console.log("Decode token: ", decodeToken);

// const verify = jwt.verify(token, secret);
// console.log("Verify token: ", verify);

/* ===============JWT coding - decoding=============== */

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.set("views", "./views");
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

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
