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
    console.log(userId, "*", token);
    const result = await User.findOneAndUpdate({ _id: userId }, { token: token });
    console.log("Updating User in DB...");
    return result;
  } catch (error) {
    console.log("Update user in DB error: ", error);
  }
}

async function logout() {
  try {
    const result = await User.find();
    console.log("Reading DB...");
    return result;
  } catch (error) {
    console.log("Read DB error: ", error);
  }
}

async function current() {
  try {
    const result = await User.find();
    console.log("Reading DB...");
    return result;
  } catch (error) {
    console.log("Read DB error: ", error);
  }
}

// async function findById(id) {
//   try {
//     const result = await Contacts.findOne({ _id: id });
//     console.log("Searching by ID...");
//     return result;
//   } catch (error) {
//     console.log("Searching by ID error: ", error);
//   }
// }

// async function removeById(id) {
//   try {
//     const result = await Contacts.findOneAndRemove({ _id: id });
//     console.log("Removing by ID...");
//     return result;
//   } catch (error) {
//     console.log("Removing by ID error: ", error);
//   }
// }

// async function add(data) {
//   try {
//     const result = await Contacts.create(data);
//     console.log("Creating new contact...");
//     return result;
//   } catch (error) {
//     console.log("Contact creating error: ", error);
//   }
// }

// async function update(id, contact) {
//   try {
//     const result = await Contacts.findOneAndUpdate({ _id: id }, { $set: contact }, { new: true });
//     console.log("Updating by ID...");
//     return result;
//   } catch (error) {
//     console.log("Updating by ID error: ", error);
//   }
// }

// async function updateFavorite(id, body) {
//   try {
//     const result = await Contacts.findOneAndUpdate({ _id: id }, { $set: body }, { new: true });
//     console.log("Favorite Updating...");
//     return result;
//   } catch (error) {
//     console.log("Favorite Updating error: ", error);
//   }
// }

module.exports = {
  userCheck,
  userCreate,
  userUpdate,
  logout,
  current,
};
