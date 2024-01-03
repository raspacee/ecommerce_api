const { query } = require("../db/index.js");

exports.create_review = (product_id, user_id, description, rating, date) => {
  return query(
    "insert into review (description, rating, created_at, product_id, created_by) \
    values ($1, $2, $3, $4, $5) returning *",
    [description, rating, date, product_id, user_id]
  );
};
