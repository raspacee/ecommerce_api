const { body, check } = require("express-validator");
const { query } = require("../db/index.js");
const { CustomError } = require("../helpers/errorHandler.js");

exports.admin_login_validator = [
  body("email", "Email field missing")
    .trim()
    .notEmpty()
    .isEmail()
    .withMessage("Email is not correct"),
  body("password", "Password field missing").trim().notEmpty(),
];

exports.admin_create_product_validator = [
  body("product_name", "Product name field missing").trim().notEmpty(),
  body("product_category").trim(),
  check("unit_price")
    .isInt({ gt: 0 })
    .withMessage("Unit price should be in int and greater than 0"),
  body("stock_unit", "Stock unit field missing")
    .notEmpty()
    .isInt()
    .withMessage("Stock unit invalid"),
  body("description").trim(),
  body("supplier_id", "Supplier id field missing")
    .notEmpty()
    .custom(async (supplier_id) => {
      // Checking if the supplier id is valid
      const q = await query("select email from supplier where supplier_id=$1", [
        supplier_id,
      ]);
      if (q.rowCount == 0)
        throw new CustomError(404, "Supplier ID does not exist");
    }),
  body("available_size").trim(),
  body("available_color").trim(),
  body("unit_weight")
    .isFloat({ gt: 0.0 })
    .withMessage("Unit weight should be in decimal and greater than 0"),
];

exports.admin_create_supplier_validator = [
  body("supplier_name", "Supplier name field missing").trim().notEmpty(),
  body("address", "Address field missing").trim().notEmpty(),
  body("telephone", "Telephone field missing").trim().notEmpty(),
  body("email", "Email field missing")
    .trim()
    .notEmpty()
    .isEmail()
    .withMessage("Email invalid"),
  body("postal_code").trim(),
];

exports.admin_ship_order_validator = [
  body("shipper_id").isInt(),
  body("cart_id").isInt(),
];

exports.admin_fulfill_order_validator = [body("cart_id").isInt()];

exports.admin_create_shipper_validator = [
  body("name").trim().notEmpty(),
  body("telephone").trim().notEmpty(),
  body("email").trim().notEmpty(),
];

exports.admin_delete_product_validator = [body("product_id").isInt()];
