const { body } = require("express-validator");
const { query } = require("../db/index.js");
const { CustomError } = require("../helpers/errorHandler.js");

exports.user_signup_validator = [
  body("address_line_1", "Address line 1 missing").trim().notEmpty(),
  body("city", "City missing").trim().notEmpty(),
  body("country", "Country missing").trim().notEmpty(),
  body("address_line_2").trim().optional(),
  body("postal_code").trim().optional(),
  body("email", "Email missing")
    .trim()
    .notEmpty()
    .isEmail()
    .withMessage("Email is not correct")
    .custom(async (email) => {
      const q = await query("select email from user_ where email=$1", [email]);
      if (q.rowCount > 0) {
        throw new CustomError(409, "Email is already used");
      }
    }),
  body("password", "Password should be atleast 7 characters")
    .trim()
    .isLength({ min: 7 }),
  body("telephone", "Telephone missing")
    .trim()
    .notEmpty()
    .isLength({ min: 10, max: 10 })
    .withMessage("Incorrect telephone number"),
  body("first_name", "First name missing")
    .trim()
    .notEmpty()
    .isLength({ min: 3 })
    .withMessage("First name should be atleast 3 characters"),
  body("last_name", "Last name missing")
    .trim()
    .notEmpty()
    .isLength({ min: 3 })
    .withMessage("First name should be atleast 3 characters"),
];

exports.user_login_validator = [
  body("email", "Email field missing")
    .trim()
    .notEmpty()
    .isEmail()
    .withMessage("Email is not correct"),
  body("password", "Password field missing").trim().notEmpty(),
];

exports.user_update_address_validator = [
  body("address_line_1").trim().notEmpty(),
  body("address_line_2").trim(),
];

exports.user_update_personal_info_validator = [
  body("telephone").trim(),
  body("first_name").trim(),
  body("last_name").trim(),
];
