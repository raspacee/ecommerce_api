const { validationResult } = require("express-validator");
const query = require("../db/index.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.user_signup = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send({ errors: result.array() });
  }

  const {
    address_line_1,
    address_line_2,
    city,
    country,
    postal_code,
    email,
    first_name,
    last_name,
    password,
    telephone,
  } = req.body;

  try {
    await query("begin transaction");

    const text =
      "insert into user_address (address_line_1, address_line_2, \
    city, postal_code, country) values ($1, $2, $3, $4, $5) returning address_id";
    const values = [address_line_1, address_line_2, city, postal_code, country];
    const q = await query(text, values);

    const salt = bcrypt.genSaltSync(10);
    const hash_password = bcrypt.hashSync(password, salt);

    const text2 =
      "insert into user_ (email, address_id, created_at, password, \
    telephone, first_name, last_name) values ($1, $2, $3, $4, $5, $6, $7)";
    const values2 = [
      email,
      q.rows[0].address_id,
      new Date(),
      hash_password,
      telephone,
      first_name,
      last_name,
    ];
    await query(text2, values2);
    await query("end transaction");
    return res
      .status(200)
      .send({ message: "Successfully signed up, you can now login." });
  } catch (err) {
    await query("rollback");
    return res.status(400).send({ errors: err });
  }
};

exports.user_login = async (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send({ errors: result.array() });
  }

  const { email, password } = req.body;

  try {
    const text =
      "select user_id, email, first_name, last_name, password from user_ where \
      email=$1";
    const values = [email];
    const q = await query(text, values);
    if (q.rowCount == 0) {
      return res.status(400).send({ error: ["Email not found"] });
    }
    const row = q.rows[0];

    if (bcrypt.compareSync(password, row.password)) {
      const token = jwt.sign(
        {
          user_id: row.user_id,
          email: row.email,
          first_name: row.first_name,
          last_name: row.last_name,
        },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );
      return res.status(200).send({ token });
    } else {
      return res.status(400).send({ errors: ["Incorrect password"] });
    }
  } catch (err) {
    return res.status(400).send({ errors: err });
  }
};
