const { query } = require("../db/index.js");

exports.get_admin_by_email = async (email) => {
  const text =
    "select admin_id, email, first_name, last_name, password, privilege from admin_ where \
      email=$1";
  const values = [email];
  return query(text, values);
};
