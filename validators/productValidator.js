const { body, param } = require("express-validator");
const { query } = require("../db/index.js");
const { CustomError } = require("../helpers/errorHandler.js");

exports.place_order_validator = [
  body("cart")
    .isArray({ min: 1 })
    .notEmpty()
    .withMessage("Cart should an array"),
  body("cart.*.product_id").isInt().withMessage("Product ID should be int"),
  body("cart.*.quantity").isInt().withMessage("Product quantity should be int"),
  body("payment_type")
    .trim()
    .custom((payment_type) => {
      if (payment_type !== "ESEWA") {
        throw new CustomError(400, "payment_type is not correct");
      } else {
        return true;
      }
    }),
];

exports.cancel_order_validator = [body("cart_id").isInt({ min: 1 }).notEmpty()];

exports.get_product_validator = [param("product_id").isInt({ min: 1 })];
