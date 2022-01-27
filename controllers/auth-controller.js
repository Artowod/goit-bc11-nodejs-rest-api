const { joiUserSchema, User } = require("../schemas/user");
const authService /* {  signup, login, logout, current,  }  */ = require("../service/auth-service");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secret = process.env.SECRET;
const TEMP_STORAGE = process.env.TEMP_STORAGE;
const PUBLIC_STORAGE = process.env.PUBLIC_STORAGE;
const gravatar = require("gravatar");
const fs = require("fs").promises;
const path = require("path");
const Jimp = require("jimp");

const avatarURLCreation = (email, photo = "monsterid") =>
  gravatar.url(email, { /*  s: "250",  */ d: photo, protocol: "http" });

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
  //  await authService.avatarUpdate(req.user.id, req.newAvatar /* ???????? */);
  const subFolder = "avatars";

  const { filename } = req.file;
  const temporaryFile = path.join(__dirname, `../${TEMP_STORAGE}/`, filename);
  const publicFile = path.join(__dirname, `../${PUBLIC_STORAGE}/${subFolder}/`, filename);

  const publicFileForRemoteAccess = `http://127.0.0.1:3000/${subFolder}/${filename}`; // "http://127.0.0.1:3000/avatars/elf.jpg";

  // +1 - store file to temp dir - already done in middleware
  // +2 - modify by jimp  - res => 250x250
  // +3 - move it to public place
  // +4 - unique file name  - already in middleware
  // +5 - store url to DB

  await Jimp.read(temporaryFile)
    .then((picture) => {
      return picture.resize(250, Jimp.AUTO).quality(80).write(publicFile);
    })
    .then(() => fs.rm(temporaryFile))
    .catch((err) => {
      console.error(err);
      res.status(400).json({ status: "Fail", message: err });
    });

  // const remotePic = "https://gdb.rferl.org/08810000-0a00-0242-2050-08d9da027939_w1023_r1_s.jpg";
  // const remotePic = "http://127.0.0.1:3000/avatars/elf.jpg";

  const generatedGravatarUrl = avatarURLCreation(req.user.email, publicFileForRemoteAccess /* remotePic */);
  await authService.avatarUpdate(req.user.id, generatedGravatarUrl);

  // res.status(204).json({
  //   message: "Avatar changed successfully",
  // });
  res.json({
    message: "Avatar changed successfully",
    "------": "--------------------------------",
    generatedGravatarUrl,
    avatar_pic: publicFile,
    avatar_pic_forRemote: publicFileForRemoteAccess,
  });
};

module.exports = { signup, login, logout, current, avatars };
