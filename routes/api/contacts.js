/* ----------------- ROUTING ------------------- */

const express = require("express");
const router = express.Router();
const contactsController = require("../../controllers/contacts-controller");

const jwt = require("jsonwebtoken");
require("dotenv").config();
const secret = process.env.SECRET;
const passport = require("passport");
const User = require("../../schemas/user");

const auth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    console.log("Bearer " + user.token);
    if (!user || err || req.headers.authorization !== "Bearer " + user.token) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Unauthorized",
        data: "Unauthorized",
      });
    }
    req.user = user;
    next();
  })(req, res, next);
};

router.post("/signup", async (req, res, next) => {
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

router.post("/login", async (req, res, next) => {
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

  await User.updateOne({ _id: user.id }, { token });

  res.json({
    status: "success",
    code: 200,
    data: {
      token,
    },
  });
});

router.get("/logout", auth, async (req, res, next) => {
  await User.updateOne({ _id: req.user.id }, { token: null });
  res.json({
    status: "success",
    code: 200,
  });
});

router.get("/current", auth, (req, res, next) => {
  const { email } = req.user;
  res.json({
    status: "success",
    code: 200,
    data: {
      message: `Authorization was successful: ${email}`,
    },
  });
});

router.get("/", async (req, res, next) => {
  res.render("index", { description: "Please use the following path to manage contacts: /api/contacts" });
});

const subDomain = "/contacts/";
router.get(subDomain, auth, contactsController.listContacts);

router.get(`${subDomain}:contactId`, auth, contactsController.getContactById);

router.delete(`${subDomain}:contactId`, auth, contactsController.removeContact);

router.post(`${subDomain}`, auth, contactsController.addContact);

router.put(`${subDomain}:contactId`, auth, contactsController.updateContact);

router.patch(`${subDomain}:contactId/favorite`, auth, contactsController.updateFavoriteContact);

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
