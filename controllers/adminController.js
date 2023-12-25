const { validationResult } = require("express-validator");
const { query } = require("../db/index.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const es = require("../elasticsearch.js");

exports.admin_login = async (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send({ errors: result.array() });
  }

  const { email, password } = req.body;

  try {
    const text =
      "select admin_id, email, first_name, last_name, password, privilege from admin_ where \
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
          admin_id: row.admin_id,
          email: row.email,
          first_name: row.first_name,
          last_name: row.last_name,
          privilege: row.privilege,
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

exports.admin_create_product = async (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send({ errors: result.array() });
  }

  const {
    product_name,
    product_category,
    unit_price,
    stock_unit,
    description,
    supplier_id,
    available_size,
    available_color,
    unit_weight,
  } = req.body;

  try {
    const text =
      "insert into product (product_name, product_category, unit_price, stock_unit, \
    description, supplier_id, available_size, available_color, unit_weight, created_at) values \
    ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) returning *";
    const values = [
      product_name,
      product_category,
      unit_price,
      stock_unit,
      description,
      supplier_id,
      available_size,
      available_color,
      unit_weight,
      new Date(),
    ];
    const q = await query(text, values);
    await es.index({
      index: "product_index",
      body: {
        product_id: q.rows[0].product_id,
        product_name,
        description,
      },
    });

    return res.status(200).send({ product: q.rows });
  } catch (err) {
    console.log(err);
    return res.status(400).send({ errors: err });
  }
};

exports.admin_create_supplier = async (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send({ errors: result.array() });
  }

  const { supplier_name, address, telephone, email, postal_code } = req.body;

  try {
    // Check if the supplier is already added
    const text =
      "select supplier_name from supplier where \
      email=$1";
    const values = [email];
    const q = await query(text, values);
    if (q.rowCount > 0) {
      return res.status(400).send({ error: ["Supplier already added"] });
    }

    const text2 =
      "insert into supplier (supplier_name, address, telephone, email, postal_code)\
    values ($1,$2,$3,$4,$5) returning *";
    const values2 = [supplier_name, address, telephone, email, postal_code];
    const q2 = await query(text2, values2);
    return res.status(200).send({ supplier: q2.rows });
  } catch (err) {
    return res.status(400).send({ errors: err });
  }
};

exports.admin_ship_order = async (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send({ errors: result.array() });
  }

  const { shipper_id, cart_id } = req.body;
  try {
    const q = await query("select shipper_id from cart where cart_id=$1", [
      cart_id,
    ]);
    if (q.rows[0].shipper_id != null)
      throw { error: "The order has already been shipped" };
    await query(
      "update cart set shipper_id=$1, shipped_on=$2 where cart_id=$3",
      [shipper_id, new Date(), cart_id]
    );
    // TODO: send a email to customer to tell them order has been shipped
    return res
      .status(200)
      .send({ message: `Order #${cart_id} has been shipped for delivery` });
  } catch (err) {
    return res.status(400).send({ errors: err });
  }
};

exports.admin_fulfill_order = async (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send({ errors: result.array() });
  }

  try {
    const q = await query(
      "select shipper_id, fulfilled from cart where cart_id=$1",
      [req.body.cart_id]
    );
    if (q.rowCount == 0) throw { error: "Order not found" };
    if (q.rows[0].fulfilled == true)
      throw { error: "The order has already been fulfilled" };
    else if (q.rows[0].shipper_id == null)
      throw { error: "Cannot fulfill a order that has not been shipped yet" };
    await query("update cart set fulfilled=TRUE where cart_id=$1", [
      req.body.cart_id,
    ]);
    return res.status(200).send({
      message: `Order #${req.body.cart_id} has been fulfilled successfully`,
    });
  } catch (err) {
    return res.status(400).send({ errors: err });
  }
};
