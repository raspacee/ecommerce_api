const { query } = require("../db/index.js");

exports.create_payment = async (cart_id, transaction_uuid) => {
  return query(
    "insert into payment (created_at, transaction_uuid, cart_id) \
    values ($1, $2, $3) returning *",
    [new Date(), transaction_uuid, cart_id]
  );
};
