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
