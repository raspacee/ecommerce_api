const { validationResult } = require("express-validator");
const { query } = require("../db/index.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const es = require("../elasticsearch.js");
const admin = require("../models/adminModel.js");
const product = require("../models/productModel.js");
const supplier = require("../models/supplierModel.js");
const cart = require("../models/cartModel.js");
const shipper = require("../models/shipperModel.js");
const { CustomError } = require("../helpers/errorHandler.js");

exports.admin_login = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return next(new CustomError(400, "Err", result.array()));
  }

  const { email, password } = req.body;

  try {
    const q = await admin.get_admin_by_email(email);
    if (q.rowCount == 0) {
      throw new CustomError(404, "Email not found");
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
      throw new CustomError(401, "Incorrect password");
    }
  } catch (err) {
    next(err);
  }
};

exports.admin_create_product = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return next(new CustomError(400, "Err", result.array()));
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
    next(err);
  }
};

exports.admin_create_supplier = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return next(new CustomError(400, "Err", result.array()));
  }

  const { supplier_name, address, telephone, email, postal_code } = req.body;

  try {
    // Check if the supplier is already added
    const q = await supplier.get_supplier_by_email(email);
    if (q.rowCount > 0) {
      throw new CustomError(409, "Supplier already added");
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
    next(err);
  }
};

exports.admin_ship_order = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return next(new CustomError(400, "Err", result.array()));
  }

  const { shipper_id, cart_id } = req.body;
  try {
    const q = await query("select shipper_id from cart where cart_id=$1", [
      cart_id,
    ]);
    if (q.rows[0].shipper_id != null)
      throw new CustomError(409, "The order has already been shipped");
    await query(
      "update cart set shipper_id=$1, shipped_on=$2 where cart_id=$3",
      [shipper_id, new Date(), cart_id]
    );
    // TODO: send a email to customer to tell them order has been shipped
    return res
      .status(200)
      .send({ message: `Order #${cart_id} has been shipped for delivery` });
  } catch (err) {
    next(err);
  }
};

exports.admin_fulfill_order = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return next(new CustomError(400, "Err", result.array()));
  }

  try {
    const q = await cart.get_cart_by_id(req.body.cart_id);
    if (q.rowCount == 0) throw new CustomError(404, "Order not found");
    if (q.rows[0].fulfilled == true)
      throw new CustomError(409, "The order has already been fulfilled");
    else if (q.rows[0].shipper_id == null)
      throw new CustomError(
        403,
        "Cannot fulfill a order that has not been shipped yet"
      );
    await query("update cart set fulfilled=TRUE where cart_id=$1", [
      req.body.cart_id,
    ]);
    return res.status(200).send({
      message: `Order #${req.body.cart_id} has been fulfilled successfully`,
    });
  } catch (err) {
    next(err);
  }
};

exports.admin_create_shipper = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return next(new CustomError(400, "Err", result.array()));
  }

  try {
    const { name, telephone, email } = req.body;
    const q = await shipper.create_shipper(name, telephone, email);
    return res.status(201).send(q.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.admin_delete_product = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return next(new CustomError(400, "Err", result.array()));
  }

  try {
    const { product_id } = req.body;
    await product.delete_by_id(product_id);
    return res
      .status(200)
      .send({ message: "Successfully deleted the product" });
  } catch (err) {
    next(err);
  }
};

exports.admin_update_product = async (req, res, next) => {
  try {
    const {
      product_id,
      product_name,
      product_category,
      unit_price,
      stock_unit,
      description,
      available_size,
      available_color,
      unit_weight,
    } = req.body;

    const q = await product.get_product_by_id(product_id);
    if (q.rowCount == 0) throw new CustomError(404, "Product not found");

    const row = q.rows[0];
    await product.update_product(
      product_id,
      product_name || row.product_name,
      product_category || row.product_category,
      unit_price || row.unit_price,
      stock_unit || row.stock_unit,
      description || row.description,
      available_size || row.available_size,
      available_color || row.available_color,
      unit_weight || row.unit_weight
    );
    return res
      .status(200)
      .send({ message: "Successfully updated product information" });
  } catch (err) {
    next(err);
  }
};
