const { joiUserSchema, User } = require("../schemas/user");
const authService /* {  signup, login, logout, current,  }  */ = require("../service/auth-service");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secret = process.env.SECRET;
const { TEMP_STORAGE, PUBLIC_STORAGE, LOCAL_HOST, SITE_NAME } = process.env;
const gravatar = require("gravatar");
const fs = require("fs").promises;
const path = require("path");
const Jimp = require("jimp");
const sendEmail = require("../sendgrid/utils/sendEmail");
const { randomUUID } = require("crypto");

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

  const verificationToken = randomUUID();
  const newUser = new User({ password, email, verificationToken });
  newUser.setPassword(password);
  newUser.avatarURL = avatarURLCreation(email);
  const result = await authService.userCreate(newUser);

  // ----------------- send email ----------------------
  const htmlPartOne = "<h1>Verification:</h1><p>Please verify your email by this link: </p>";
  const htmlPartTwo = `<a href="${SITE_NAME}/api/users/verify/${verificationToken}"> VERIFY </a>`;
  const html = htmlPartOne + htmlPartTwo;
  const data = {
    to: email,
    subject: "Verification email. Please verify.",
    html,
  };
  await sendEmail(data);
  // ----------------- send email ----------------------

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
  if (!user.verify) {
    return res.status(401).json({
      message:
        "Email is not verified. Please use verification link which was sent to you on your email during the registration.",
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
  const subFolder = "avatars";

  const { filename } = req.file;
  const temporaryFile = path.join(__dirname, `../${TEMP_STORAGE}/`, filename);
  const publicFile = path.join(__dirname, `../${PUBLIC_STORAGE}/${subFolder}/`, filename);

  const publicFileForRemoteAccess = `${LOCAL_HOST}/${subFolder}/${filename}`; // "http://127.0.0.1:3000/avatars/elf.jpg";

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

const verify = async (req, res, next) => {
  const verificationToken = req.params.verificationToken;
  const verifiedUserByToken = await authService.checkVerificationToken(verificationToken);
  // if (verifiedUserByToken.verify) {
  //   res.status(400).json({ message: "Email is already verified!" });
  // }
  if (verifiedUserByToken) {
    res.status(200).json({ message: `Email <${verifiedUserByToken.email}> verified successfully! ` });
  } else {
    res.status(404).json({ message: "User not found" });
  }
  // ----------------- send email ----------------------
  // const html = "<h1>BE READY DUDE $)!</h1><p>you will receive Lots of MONEY !!! hahaha!!! - hello from NodeJS</p>";
  // const data = {
  //   to: "maximkiz@gmail.com",
  //   subject: "Hi I am testing email. - But Don`t worry !!! It`s ME - SERG",
  //   html,
  // };
  // await sendEmail(data);
  // res.json({ status: "SUCCESS" });
  // ----------------- send email ----------------------
};

const reVerify = async (req, res, next) => {
  if (!("email" in req.body)) res.status(400).json({ message: "missing required field: <email>" });

  const { email } = req.body;
  const verifiedUserByEmail = await authService.userCheck({ email });
  if (verifiedUserByEmail.verify) {
    res.status(400).json({ message: "Verification has already been passed" });
  }

  // ----------------- send email ----------------------
  const htmlPartOne = "<h1>Verification:</h1><p>Please verify your email by this link: </p>";
  const htmlPartTwo = `<a href="${SITE_NAME}/api/users/verify/${verifiedUserByEmail.verificationToken}"> VERIFY </a>`;
  const html = htmlPartOne + htmlPartTwo;
  const data = {
    to: email,
    subject: "Verification email. Please verify.",
    html,
  };
  await sendEmail(data);
  // ----------------- send email ----------------------

  res.status(200).json({ message: "Verification email sent" });
};

module.exports = { signup, login, logout, current, avatars, verify, reVerify };
