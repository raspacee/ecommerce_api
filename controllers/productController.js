const { validationResult } = require("express-validator");
const { query, pool } = require("../db/index.js");
const es = require("../elasticsearch.js");
const product = require("../models/productModel.js");
const cart = require("../models/cartModel.js");
const order = require("../models/orderModel.js");
const { CustomError } = require("../helpers/errorHandler.js");

exports.product_search = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    next(new CustomError(400, "err", result.array()));
  }

  try {
    const response = await es.search({
      index: "product_index",
      body: {
        query: {
          bool: {
            should: [
              {
                match: {
                  product_name: req.query.q,
                },
              },
              {
                match: {
                  description: req.query.q,
                },
              },
            ],
          },
        },
      },
    });

    const results = [];

    // Extract and log the hits (documents) from the response
    const hits = response.body.hits.hits;
    for (let i = 0; i < hits.length; i++) {
      const q = await product.get_product_by_id(hits[i]._source.product_id);
      results.push(q.rows[0]);
    }
    return res.status(200).send({ matches: results });
  } catch (err) {
    next(500, err);
  }
};

exports.place_order = async (req, res, next) => {
  /* Cart should be in this form
    [{
      product_id,
      quantity
    }]
  */
  const result = validationResult(req);
  if (!result.isEmpty()) {
    next(new CustomError(400, "err", result.array()));
  }

  const client = await pool.connect();

  try {
    await client.query("begin transaction");
    // Create a cart first
    const c = await cart.create_cart(
      client,
      new Date(),
      false,
      req.user.user_id
    );
    // Making sure all the product quantities are available
    let errors = [];
    let orders = [];
    let total_cost = 0;
    for (let item of req.body.cart) {
      const q = await product.get_product_by_id(item.product_id);
      if (q.rowCount == 0) throw new Error("Product ID not found");

      const row = q.rows[0];
      if (item.quantity > row.stock_unit) {
        errors.push({
          product_id: item.product_id,
          product_name: row.product_name,
          error: `Not enough product stocks. Only ${row.stock_unit} units are available`,
        });
      } else {
        // Create a order
        const o = await order.create_order(
          client,
          item.product_id,
          item.quantity,
          new Date(),
          c.rows[0].cart_id,
          item.quantity * row.unit_price
        );
        orders.push(o.rows[0]);
        const remaining_stock = row.stock_unit - item.quantity;
        await product.update_stock(client, remaining_stock, item.product_id);
        total_cost += item.quantity * row.unit_price;
      }
    }
    if (errors.length > 0) throw new CustomError(503, "err", errors);
    // If we reach here, it means everything is fine

    // Update the previous total_cost with the new total_cost
    await cart.update_total_cost(client, total_cost, c.rows[0].cart_id);
    c.rows[0].total_cost = total_cost;
    await client.query("end transaction");

    // Get all the order's product name, quantity and price using inner join
    let results = [];
    let q = await order.inner_join_product(c.rows[0].cart_id);
    results.push(q.rows);
    return res.status(200).send({
      message: "Your order has been noted. It will be delivered soon",
      cart: c.rows[0],
      orders: results,
    });
    // TODO: send a email to users confirming their orders
  } catch (err) {
    await client.query("rollback");
    next(err);
  } finally {
    client.release();
  }
};

exports.cancel_order = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    next(new CustomError(400, "err", result.array()));
  }

  try {
    const q = await cart.get_cart_by_id(req.body.cart_id);
    if (q.rowCount == 0) throw new CustomError(404, "Order ID not found");

    if (q.rows[0].ordered_by != req.user.user_id) {
      throw {
        error:
          "You cannot cancel this order since you did not create this order.",
      };
    } else if (q.rows[0].shipped_on) {
      throw {
        error: "Your order is already shipped. It cannot be canceled now.",
      };
    } else if (q.rows[0].is_cancelled) {
      throw {
        error: "Your order is already cancelled before.",
      };
    } else {
      await query("update cart set is_cancelled = true where cart_id=$1", [
        req.body.cart_id,
      ]);
      return res
        .status(200)
        .send({ message: "Successfully cancelled your order " });
    }
  } catch (err) {
    next(err);
  }
};

exports.track_order = async (req, res, next) => {
  try {
    const q = await cart.get_cart_by_id(req.params.cart_id);
    if (q.rowCount == 0) throw new CustomError(404, "Order ID not found");

    if (q.rows[0].ordered_by != req.user.user_id) {
      throw new CustomError(
        403,
        "You cannot track this order since you did not create this order."
      );
    } else if (q.rows[0].shipper_id > 0) {
      const q = await cart.inner_join_shipper(req.params.cart_id);
      return res.status(200).send({ order: q.rows[0] });
    } else {
      return res.status(200).send({ order: q.rows[0] });
    }
  } catch (err) {
    next(err);
  }
};

exports.get_product = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    next(new CustomError(400, "Err", result.array()));
  }

  try {
    const q = await product.get_product_by_id(req.params.product_id);
    if (q.rowCount == 0) throw new CustomError(500, "Product ID not found");
    return res.status(200).send(q.rows[0]);
  } catch (err) {
    next(err);
  }
};
