exports.get_supplier_by_email = async (email) => {
  const text =
    "select * from supplier where \
      email=$1";
  const values = [email];
  return query(text, values);
};

exports.create_supplier = async (
  supplier_name,
  address,
  telephone,
  email,
  postal_code
) => {
  const text2 =
    "insert into supplier (supplier_name, address, telephone, email, postal_code)\
    values ($1,$2,$3,$4,$5) returning *";
  const values2 = [supplier_name, address, telephone, email, postal_code];
  return query(text2, values2);
};
