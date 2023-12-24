const router = require("express").Router();
const userController = require("../controllers/userController.js");
const userValidator = require("../validators/userValidator.js");

/* User new account signup */
router.post(
  "/signup",
  userValidator.user_signup_validator,
  userController.user_signup
);

/* User get login token */
router.post(
  "/login",
  userValidator.user_login_validator,
  userController.user_login
);

/* User update address information */
router.put("/address", (req, res) => {});

/* User update personal information */
router.put("/personal", (req, res) => {});

/* User get all orders */
router.get("/my_orders", async (req, res) => {});

module.exports = router;
