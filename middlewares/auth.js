const passport = require("passport");

const auth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    // console.log("user ", user);
    // console.log("err ", err);
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

module.exports = auth;
