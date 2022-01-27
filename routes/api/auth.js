/* ----------------- ROUTING ------------------- */

const express = require("express");
const router = express.Router();
const authController = require("../../controllers/auth-controller");
const auth = require("../../middlewares/auth");
const avatarUpload = require("../../middlewares/fileUpload");

router.get("/", async (req, res, next) => {
  res.render("index", { description: "Please use /signup or /login or /logout or /current here" });
});

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", auth, authController.logout);
router.get("/current", auth, authController.current);
router.post("/avatars", [auth, avatarUpload], authController.avatars);

module.exports = router;
