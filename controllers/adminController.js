const { validationResult } = require("express-validator");
const { query } = require("../db/index.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const es = require("../elasticsearch.js");
const admin = require("../models/adminModel.js");
const product = require("../models/productModel.js");
const supplier = require("../models/supplierModel.js");
const cart = require("../models/cartModel.js");

exports.admin_login = async (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send({ errors: result.array() });
  }

  const { email, password } = req.body;

  try {
    const q = await admin.get_admin_by_email(email);
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
        process.env.ADMIN_JWT_SECRET,
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
    const q = await product.create_product(
      product_name,
      product_category,
      unit_price,
      stock_unit,
      description,
      supplier_id,
      available_size,
      available_color,
      unit_weight,
      new Date()
    );
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
    const q = await supplier.get_supplier_by_email(email);
    if (q.rowCount > 0) {
      return res.status(400).send({ error: ["Supplier already added"] });
    }

    const q2 = await supplier.create_supplier(
      supplier_name,
      address,
      telephone,
      email,
      postal_code
    );
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
    const q = await cart.get_cart_by_id(req.body.cart_id);
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
