const { validationResult } = require("express-validator");
const { pool } = require("../db/index.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userAddress = require("../models/userAddressModel.js");
const user = require("../models/userModel.js");
const cart = require("../models/cartModel.js");
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

exports.user_update_address = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    next(new CustomError(400, "Err", result.array()));
  }

  const { address_line_1, address_line_2 } = req.body;
  try {
    const q = await userAddress.update_user_address(
      req.user.user_id,
      address_line_1,
      address_line_2
    );
    return res.status(200).send({ updated_data: q.rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.get_all_orders = async (req, res, next) => {
  try {
    const q = await cart.get_all_orders(req.user.user_id);
    return res.status(200).send(q);
  } catch (err) {
    next(err);
  }
};

exports.user_update_personal_info = async (req, res, next) => {
  try {
    let u = await user.get_user(req.user.user_id);
    if (u.rowCount == 0)
      next(new CustomError(401, "User token expired or user not found"));
    u = u.rows[0];

    const { telephone, first_name, last_name } = req.body;
    await user.update_personal_info(
      req.user.user_id,
      telephone || u.telephone,
      first_name || u.first_name,
      last_name || u.last_name
    );
    return res
      .status(200)
      .send({ message: "Successfully updated personal info" });
  } catch (err) {
    next(err);
  }
};
