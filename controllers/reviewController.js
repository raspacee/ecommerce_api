const review = require("../models/reviewModel.js");
const { validationResult } = require("express-validator");
const { CustomError } = require("../helpers/errorHandler.js");

exports.create_review = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return next(new CustomError(400, "Err", result.array()));
  }

  try {
    const { product_id, description, rating } = req.body;
    const r = await review.create_review(
      product_id,
      req.user.user_id,
      description,
      parseInt(rating),
      new Date()
    );
    return res.status(201).send({ review: r.rows[0] });
  } catch (err) {
    next(err);
  }
};
