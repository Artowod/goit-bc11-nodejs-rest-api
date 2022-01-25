/* ----------------- ROUTING ------------------- */

const express = require("express");
const router = express.Router();
const contactsController = require("../../controllers/contacts-controller");
const auth = require("../../middlewares/auth");

router.get("/", auth, contactsController.listContacts);

router.get("/:contactId", auth, contactsController.getContactById);

router.delete("/:contactId", auth, contactsController.removeContact);

router.post("/", auth, contactsController.addContact);

router.put("/:contactId", auth, contactsController.updateContact);

router.patch("/:contactId/favorite", auth, contactsController.updateFavoriteContact);

module.exports = router;
