const { query } = require("../db/index.js");

exports.create_user = async (
  client, // this requires passing a client since its code is written inside a transaction
  email,
  address_id,
  date,
  hash_password,
  telephone,
  first_name,
  last_name
) => {
  const text =
    "insert into user_ (email, address_id, created_at, password, \
    telephone, first_name, last_name) values ($1, $2, $3, $4, $5, $6, $7)";
  const values = [
    email,
    address_id,
    date,
    hash_password,
    telephone,
    first_name,
    last_name,
  ];
  return client.query(text, values);
};

exports.get_user_by_email = async (email) => {
  const text =
    "select user_id, email, first_name, last_name, password from user_ where \
      email=$1";
  const values = [email];
  return query(text, values);
};
