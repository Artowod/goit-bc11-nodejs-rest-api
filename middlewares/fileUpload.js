const multer = require("multer");
// const path = require("path");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const TMP_STORAGE = process.env.TEMP_STORAGE;

const storage = multer.diskStorage({
  destination: `./${TMP_STORAGE}`,
  filename: function (req, file, callBack) {
    const uniqueSuffix = uuidv4();
    const [fileName, fileExt] = file.originalname.split(".");
    callBack(null, `${fileName}--${uniqueSuffix}.${fileExt}`);
  },
});

const avatarUpload = multer({ storage }).single("avatar");

module.exports = avatarUpload;
