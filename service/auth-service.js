/* ----------------- Users DB Handling ------------------ */

const { User } = require("../schemas/user");

async function userCheck({ email }) {
  try {
    const result = await User.findOne({ email });
    console.log("Reading DB...");
    return result;
  } catch (error) {
    console.log("Read DB error: ", error);
  }
}

async function userCreate(newUser) {
  try {
    const result = await newUser.save();
    console.log("Creating user in DB...");
    return result;
  } catch (error) {
    console.log("Create user DB error: ", error);
  }
}

async function tokenUpdate(userId, token) {
  try {
    const result = await User.findOneAndUpdate({ _id: userId }, { token: token });
    console.log("Updating User in DB...");
    return result;
  } catch (error) {
    console.log("Update user in DB error: ", error);
  }
}

async function avatarUpdate(userId, avatarURL) {
  try {
    const result = await User.findOneAndUpdate({ _id: userId }, { avatarURL });
    console.log("Updating User in DB...");
    return result;
  } catch (error) {
    console.log("Update user in DB error: ", error);
  }
}

async function checkVerificationToken(verificationToken) {
  try {
    const result = await User.findOneAndUpdate({ verificationToken }, { verificationToken: null, verify: true });
    console.log("Updating User by VerificationToken in DB...");
    return result;
  } catch (error) {
    console.log("Update user in DB be VerificationToken error: ", error);
  }
}

module.exports = {
  userCheck,
  userCreate,
  tokenUpdate,
  avatarUpdate,
  checkVerificationToken,
};
