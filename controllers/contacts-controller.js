// const Joi = require("joi");
const { joiContactsSchema } = require("../schemas/contacts");

const { findById, removeById, add, readDB, update, updateFavorite } = require("../service/contacts-service");

const listContacts = (req, res) => {
  const { _id: owner } = req.user;
  readDB(owner).then((result) => {
    return res.status(200).json(result);
  });
};

const getContactById = async (req, res) => {
  const { _id: owner } = req.user;
  const id = req.params.contactId;
  const contactById = await findById(id, owner);
  return contactById
    ? res.status(200).json(contactById)
    : res.status(404).json({ message: `contact with id:${id} not found` });
};

const removeContact = async (req, res) => {
  const { _id: owner } = req.user;
  const id = req.params.contactId;
  const removedContactById = await removeById(id, owner);
  return removedContactById
    ? res.status(200).json({ message: `contact with id:${id} deleted` })
    : res.status(404).json({ message: `contact with id:${id} not found` });
};

const addContact = async (req, res) => {
  try {
    const newContact = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      favorite: req.body.favorite ? req.body.favorite : false,
    };
    const { error } = joiContactsSchema.validate(newContact);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const result = await add({ ...newContact, owner: req.user._id });

    return res.status(201).json(result);
  } catch (error) {
    console.log("Add new contact error: ", error);
  }
};

const updateContact = async (req, res) => {
  try {
    const { _id: owner } = req.user;
    const id = req.params.contactId;
    const contact = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      favorite: req.body.favorite ? req.body.favorite : false,
    };
    const { error } = joiContactsSchema.validate(contact);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const result = await update(id, owner, { ...contact, owner });

    return result ? res.status(201).json(result) : res.status(404).json({ message: `contact with id:${id} not found` });
  } catch (error) {
    console.log("Update contact error: ", error);
  }
};

const updateFavoriteContact = async (req, res) => {
  try {
    const { _id: owner } = req.user;
    const id = req.params.contactId;
    const favorite = {
      favorite: req.body.favorite,
    };
    if (typeof favorite.favorite !== "boolean") {
      return res.status(400).json({ message: "missing field favorite" });
    }
    const result = await updateFavorite(id, owner, favorite);
    return result ? res.status(201).json(result) : res.status(404).json({ message: `contact with id:${id} not found` });
  } catch (error) {
    console.log("Update status error: ", error);
    return res.status(404).json({ message: "Not found" });
  }
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateFavoriteContact,
};
