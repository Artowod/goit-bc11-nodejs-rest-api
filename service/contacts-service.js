/* ----------------- Contacts DB Handling ------------------ */

const { Contact } = require("../schemas/contacts");

async function readDB(owner) {
  try {
    const result = await Contact.find({ owner }); /* .populate("owner") */
    console.log("Reading DB...");
    return result;
  } catch (error) {
    console.log("Read DB error: ", error);
  }
}

async function findById(id, owner) {
  try {
    const result = await Contact.findOne({ _id: id, owner });
    console.log("Searching by ID...");
    return result;
  } catch (error) {
    console.log("Searching by ID error: ", error);
  }
}

async function removeById(id, owner) {
  try {
    const result = await Contact.findOneAndRemove({ _id: id, owner });
    console.log("Removing by ID...");
    return result;
  } catch (error) {
    console.log("Removing by ID error: ", error);
  }
}

async function add(data) {
  try {
    const result = await Contact.create(data);
    console.log("Creating new contact...");
    return result;
  } catch (error) {
    console.log("Contact creating error: ", error);
  }
}

async function update(id, owner, contact) {
  try {
    const result = await Contact.findOneAndUpdate({ _id: id, owner }, { $set: contact }, { new: true });
    console.log("Updating by ID...");
    return result;
  } catch (error) {
    console.log("Updating by ID error: ", error);
  }
}

async function updateFavorite(id, owner, body) {
  try {
    const result = await Contact.findOneAndUpdate({ _id: id, owner }, { $set: body }, { new: true });
    console.log("Favorite Updating...");
    return result;
  } catch (error) {
    console.log("Favorite Updating error: ", error);
  }
}

module.exports = {
  findById,
  removeById,
  add,
  readDB,
  update,
  updateFavorite,
};
