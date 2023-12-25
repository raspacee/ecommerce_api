const { body } = require("express-validator");
const query = require("../db/index.js");

exports.place_order_validator = [
  body("cart")
    .isArray({ min: 1 })
    .notEmpty()
    .withMessage("Cart should an array"),
  body("cart.*.product_id").isInt().withMessage("Product ID should be int"),
  body("cart.*.quantity").isInt().withMessage("Product quantity should be int"),
];
