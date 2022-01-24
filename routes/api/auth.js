/* ----------------- ROUTING ------------------- */

const express = require("express");
const router = express.Router();
const authController = require("../../controllers/auth-controller");
const passport = require("passport");

const auth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    console.log("user ", user);
    console.log("err ", err);
    // console.log("Bearer " + user.token);
    if (!user || err || req.headers.authorization !== "Bearer " + user.token) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }
    req.user = user;
    next();
  })(req, res, next);
};

router.get("/", async (req, res, next) => {
  res.render("index", { description: "Please use /signup or /login or /logout or /current here" });
});

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", auth, authController.logout);
// router.get("/current", auth, authController.current);

module.exports = router;
