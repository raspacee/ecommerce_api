const { query } = require("../db/index.js");

exports.create_shipper = async (name, telephone, email) => {
  return query(
    "insert into shipper (name, telephone, email) values \
        ($1, $2, $3) returning *",
    [name, telephone, email]
  );
};
