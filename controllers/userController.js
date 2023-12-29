const { validationResult } = require("express-validator");
const { pool } = require("../db/index.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userAddress = require("../models/userAddressModel.js");
const user = require("../models/userModel.js");
const { CustomError } = require("../helpers/errorHandler.js");

exports.user_signup = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    next(new CustomError(400, "Err", result.array()));
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

  const client = await pool.connect();
  try {
    await client.query("begin transaction");

    const q = await userAddress.create_user_address(
      client,
      address_line_1,
      address_line_2,
      city,
      postal_code,
      country
    );

    const salt = bcrypt.genSaltSync(10);
    const hash_password = bcrypt.hashSync(password, salt);

    await user.create_user(
      client,
      email,
      q.rows[0].address_id,
      new Date(),
      hash_password,
      telephone,
      first_name,
      last_name
    );
    await client.query("end transaction");
    return res
      .status(200)
      .send({ message: "Successfully signed up, you can now login." });
  } catch (err) {
    await client.query("rollback");
    next(err);
  } finally {
    client.release();
  }
};

exports.user_login = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    next(new CustomError(400, "Err", result.array()));
  }

  const { email, password } = req.body;

  try {
    const q = await user.get_user_by_email(email);
    const row = q.rows[0];
    if (q.rowCount == 0) {
      throw new CustomError(404, "Email not found");
    }
    if (bcrypt.compareSync(password, row.password)) {
      const token = jwt.sign(
        {
          user_id: row.user_id,
          email: row.email,
          first_name: row.first_name,
          last_name: row.last_name,
        },
        process.env.USER_JWT_SECRET,
        { expiresIn: "30d" }
      );
      return res.status(200).send({ token });
    } else {
      throw new CustomError(401, "Incorrect password");
    }
  } catch (err) {
    next(err);
  }
};
