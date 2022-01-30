const passport = require("passport");

const auth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    // console.log("user ", user);
    // console.log("err ", err);
    // console.log("Bearer " + user.token);
    if (!user || err || req.headers.authorization !== "Bearer " + user.token) {
      return res.status(401).json({
        message: "User is not authorized.",
      });
    }
    if (!user.verify) {
      return res.status(401).json({
        message:
          "Email is not verified. Please use verification link which was sent to you on your email during the registration.",
      });
    }
    req.user = user;
    next();
  })(req, res, next);
};

module.exports = auth;
