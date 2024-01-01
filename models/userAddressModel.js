const { query } = require("../db/index.js");

exports.create_user_address = async (
  client,
  address_line_1,
  address_line_2,
  city,
  postal_code,
  country
) => {
  const text =
    "insert into user_address (address_line_1, address_line_2, \
    city, postal_code, country) values ($1, $2, $3, $4, $5) returning address_id";
  const values = [address_line_1, address_line_2, city, postal_code, country];
  const q = await client.query(text, values);
  return q;
};

exports.update_user_address = async (
  user_id,
  address_line_1,
  address_line_2
) => {
  return query(
    "update user_address a set address_line_1=$1, address_line_2=$2 \
    from user_ u where u.user_id=$3 and u.address_id=a.address_id returning *",
    [address_line_1, address_line_2, user_id]
  );
};
