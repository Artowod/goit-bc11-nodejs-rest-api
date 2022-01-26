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

async function userUpdate(userId, token) {
  try {
    const result = await User.findOneAndUpdate({ _id: userId }, { token: token });
    console.log("Updating User in DB...");
    return result;
  } catch (error) {
    console.log("Update user in DB error: ", error);
  }
}

module.exports = {
  userCheck,
  userCreate,
  userUpdate,
};
