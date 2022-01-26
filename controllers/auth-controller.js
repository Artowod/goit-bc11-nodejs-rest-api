const { joiUserSchema, User } = require("../schemas/user");
const authService /* {  signup, login, logout, current,  }  */ = require("../service/auth-service");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secret = process.env.SECRET;
const gravatar = require("gravatar");
// const DEFAULT_PUBLIC_LOCATION = "http://127.0.0.1:3000/avatars/";

const avatarURLCreation = (email) => gravatar.url(email, { s: "250", d: "monsterid", protocol: "http" });
// gravatar.url(email, { s: "250", d: `${DEFAULT_PUBLIC_LOCATION}orc.jpg`, protocol: "http" });

const signup = async (req, res, next) => {
  const { error } = joiUserSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const { password, email } = req.body;
  const user = await authService.userCheck({ email });
  if (user) {
    return res.status(409).json({
      message: "Email in use",
    });
  }

  const newUser = new User({ password, email });
  newUser.setPassword(password);
  newUser.avatarURL = avatarURLCreation(email);
  const result = await authService.userCreate(newUser);
  return result
    ? res.status(201).json({
        user: {
          email: email,
          subscription: "starter",
        },
      })
    : res.status(400).json({ message: "Create user DB error" });
};

const login = async (req, res, next) => {
  const { error } = joiUserSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const { password, email } = req.body;
  const user = await authService.userCheck({ email });

  if (!user || !user.validPassword(password)) {
    return res.status(401).json({
      message: "Email or password is wrong",
    });
  }

  const payload = {
    id: user.id,
    email: user.email,
  };

  const token = jwt.sign(payload, secret, { expiresIn: "1h" });

  await authService.tokenUpdate(user.id, token);
  res.status(200).json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const logout = async (req, res, next) => {
  const token = null;
  await authService.tokenUpdate(req.user.id, token);
  res.status(204).json({
    message: "Logout success",
  });
};

const current = async (req, res, next) => {
  const { email, subscription } = req.user;
  res.status(200).json({
    email,
    subscription,
  });
};

const avatars = async (req, res, next) => {
  await authService.avatarUpdate(req.user.id, req.newAvatar /* ???????? */);
  res.status(204).json({
    message: "Logout success",
  });
};

module.exports = { signup, login, logout, current, avatars };
