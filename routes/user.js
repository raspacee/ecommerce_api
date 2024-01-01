const router = require("express").Router();
const userAuth = require("../auth/userAuth.js");
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
router.put(
  "/address",
  userAuth.user_auth,
  userValidator.user_update_address_validator,
  userController.user_update_address
);

/* User update personal information */
router.put(
  "/personal",
  userAuth.user_auth,
  userValidator.user_update_personal_info_validator,
  userController.user_update_personal_info
);

/* User get all orders */
router.get("/my_orders", userAuth.user_auth, userController.get_all_orders);

module.exports = router;
