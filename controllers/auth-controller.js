const { joiUserSchema, User } = require("../schemas/user");
const authService /* {  signup, login, logout, current,  }  */ = require("../service/auth-service");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secret = process.env.SECRET;

// ====================VALIDATION-START=====================
const isDataValid = (data) => {
  console.log("validation result: ", joiUserSchema.validate(data));
  return !joiUserSchema.validate(data).error;
};
// ====================VALIDATION-END=====================

// не надо вобще
// const usersList = (req, res) => {
//   list().then((result) => {
//     return res.status(200).json(result);
//   });
// };
// не надо вобще

// router.post("/signup", auth, authController.signup);
// router.post("/login", auth, authController.login);
// router.post("/logout", auth, authController.logout);
// router.get("/current", auth, authController.current);

// const getContactById = async (req, res) => {
//   const id = req.params.contactId;
//   const contactById = await findById(id);
//   return contactById
//     ? res.status(200).json(contactById)
//     : res.status(404).json({ message: `contact with id:${id} not found` });
// };

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

  const newUser = new User({ password, email });
  newUser.setPassword(password);
  const result = await authService.userCreate(newUser);
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

  const payload = {
    id: user.id,
    email: user.email,
  };

  const token = jwt.sign(payload, secret, { expiresIn: "1h" });

  // const updatedUser = await authService.userUpdate(user.id, token);
  await authService.userUpdate(user.id, token);
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
  await authService.userUpdate(req.user.id, token);
  // await User.updateOne({ _id: req.user.id }, { token: null });
  res.status(204).json({
    message: "Logout success",
  });
};

// router.get("/users/current", auth, (req, res, next) => {
//   const { email } = req.user;
//   res.json({
//     status: "success",
//     code: 200,
//     data: {
//       message: `Authorization was successful: ${email}`,
//     },
//   });
// });

module.exports = { signup, login, logout, /* current, */ isDataValid };
