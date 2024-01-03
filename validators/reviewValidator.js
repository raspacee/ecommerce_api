const { body } = require("express-validator");

exports.create_review_validator = [
  body("description").trim().isString().notEmpty(),
  body("rating")
    .isInt()
    .custom((rating) => {
      if (rating < 0 || rating > 5)
        throw new Error("Rating cannot be below 0 or above 5");
      else return true;
    }),
  body("product_id").isInt(),
];
