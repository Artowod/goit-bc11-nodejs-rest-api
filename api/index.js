/* ----------------- ROUTING ------------------- */

const express = require("express");
const router = express.Router();
const contactsController = require("../controllers/");

const jwt = require("jsonwebtoken");
require("dotenv").config();
const secret = process.env.SECRET;
// const passport = require("passport");
const User = require("../schemas/user");

// const auth = (req, res, next) => {
//   passport.authenticate("jwt", { session: false }, (err, user) => {
//     if (!user || err) {
//       return res.status(401).json({
//         status: "error",
//         code: 401,
//         message: "Unauthorized",
//         data: "Unauthorized",
//       });
//     }
//     req.user = user;
//     next();
//   })(req, res, next);
// };

router.post("/api/registration", async (req, res, next) => {
  const { password, email, subscription } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    return res.status(409).json({
      status: "error",
      code: 409,
      message: "Email is already in use",
      data: "Conflict",
    });
  }
  try {
    const newUser = new User({ password, email, subscription });
    newUser.setPassword(password);
    await newUser.save();
    res.status(201).json({
      status: "success",
      code: 201,
      data: {
        nessage: " registration successful",
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/api/login", async (req, res, next) => {
  const { password, email } = req.body;
  const user = await User.findOne({ email });

  if (!user || !user.validPassword(password)) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "Incorrect login or password",
      data: "Bad request",
    });
  }

  const payload = {
    id: user.id,
    email: user.email,
  };

  const token = jwt.sign(payload, secret, { expiresIn: "1h" });
  res.json({
    status: "success",
    code: 200,
    data: {
      token,
    },
  });
});

router.get("/", async (req, res, next) => {
  res.render("index", { description: "Please use the following path to manage contacts: /api/contacts" });
});

const subDomain = "/api/contacts/";
router.get(subDomain, contactsController.listContacts);

router.get(`${subDomain}:contactId`, contactsController.getContactById);

router.delete(`${subDomain}:contactId`, contactsController.removeContact);

router.post(`${subDomain}`, contactsController.addContact);

router.put(`${subDomain}:contactId`, contactsController.updateContact);

router.patch(`${subDomain}:contactId/favorite`, contactsController.updateFavoriteContact);

// -------------------------testing---------------------------
// router.get("/:contactId/:nextId/:lastId", async (req, res, next) => {
//   res.json({
//     contactId: ` Ты ввёл -  ${req.params.contactId}`,
//     nextId: ` Ты ввёл - ${req.params.nextId}`,
//     lastId: ` Ты ввёл -  ${req.params.lastId}`,
//   });
// });
// -----------------------------------------------------------

module.exports = router;
