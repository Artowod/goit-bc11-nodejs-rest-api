const gravatar = (req, res, next) => {
  console.log("Middleware-Gravatar: ", req.user);
  req.gravatarURL = `https://GRAVATAR+${req.user.email}`;
  next();
};

module.exports = gravatar;
