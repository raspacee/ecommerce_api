const { validationResult } = require("express-validator");
const { query, pool } = require("../db/index.js");
const es = require("../elasticsearch.js");

exports.product_search = async (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send({ errors: result.array() });
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
      const text = "select * from product where product_id=$1";
      const q = await query(text, [hits[i]._source.product_id]);
      results.push(q.rows[0]);
    }
    return res.status(200).send({ matches: results });
  } catch (error) {
    console.error("Error searching data:", error);
    return res.status(400).send({ error });
  }
};

exports.place_order = async (req, res) => {
  /* Cart should be in this form
    [{
      product_id,
      quantity
    }]
  */
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send({ errors: result.array() });
  }

  const client = await pool.connect();

  try {
    await client.query("begin transaction");
    // Create a cart first
    const cart = await client.query(
      "insert into cart (created_at, fulfilled, ordered_by, total_cost) values ($1, $2, $3, 0) returning *",
      [new Date(), false, req.user.user_id]
    );
    // Making sure all the product quantities are available
    let errors = [];
    let orders = [];
    let total_cost = 0;
    for (let item of req.body.cart) {
      const q = await client.query(
        "select product_name, unit_price, stock_unit from product where product_id=$1",
        [item.product_id]
      );
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
        const o = await client.query(
          "insert into order_ (product_id, order_unit, created_at, cart_id, cost) \
          values ($1,$2,$3,$4,$5) returning *",
          [
            item.product_id,
            item.quantity,
            new Date(),
            cart.rows[0].cart_id,
            item.quantity * row.unit_price,
          ]
        );
        orders.push(o.rows[0]);
        const remaining_stock = row.stock_unit - item.quantity;
        await client.query(
          "update product set stock_unit=$1 where product_id=$2",
          [remaining_stock, item.product_id]
        );
        total_cost += item.quantity * row.unit_price;
      }
    }
    if (errors.length > 0) throw errors;
    // If we reach here, it means everything is fine

    // Update the previous total_cost with the new total_cost
    await client.query("update cart set total_cost=$1 where cart_id=$2", [
      total_cost,
      cart.rows[0].cart_id,
    ]);
    cart.rows[0].total_cost = total_cost;
    await client.query("end transaction");

    // Get all the order's product name, quantity and price using inner join
    let results = [];
    let text =
      "select p.product_name, o.order_unit, p.unit_price, (p.unit_price * o.order_unit) as cost \
        from order_ o inner join product p on o.product_id = p.product_id where o.cart_id = $1;";
    let q = await client.query(text, [cart.rows[0].cart_id]);
    results.push(q.rows);
    return res.status(200).send({
      message: "Your order has been noted. It will be delivered soon",
      cart: cart.rows[0],
      orders: results,
    });
    // TODO: send a email to users confirming their orders
  } catch (err) {
    await client.query("rollback");
    return res.status(400).send({ err });
  } finally {
    client.release();
  }
};

exports.cancel_order = async (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send({ errors: result.array() });
  }

  try {
    const q = await query(
      "select ordered_by, shipped_on, is_cancelled from cart where cart_id=$1",
      [req.body.cart_id]
    );
    if (q.rowCount == 0) throw { error: "Order ID not found" };

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
    if (err instanceof Error)
      return res.status(400).send({ error: err.message });
    return res.status(400).send(err);
  }
};

exports.track_order = async (req, res) => {
  try {
    const q = await query(
      "select ordered_by, shipped_on, shipper_id, created_at, fulfilled, is_cancelled, \
      total_cost from cart where cart_id=$1",
      [req.params.cart_id]
    );
    if (q.rowCount == 0) throw { error: "Order ID not found" };

    if (q.rows[0].ordered_by != req.user.user_id) {
      throw {
        error:
          "You cannot track this order since you did not create this order.",
      };
    } else if (q.rows[0].shipper_id) {
      const q = await query(
        "select s.name as shipper_name, s.telephone as shipper_tele, s.email as shipper_tele, \
        c.shipped_on, c.cart_id, c.created_at, c.fulfilled, c.is_cancelled, c.total_cost \
        from cart c inner join shipper s on c.shipper_id=s.shipper_id where c.cart_id=$1",
        [req.params.cart_id]
      );
      return res.status(200).send({ order: q.rows[0] });
    } else {
      return res.status(200).send({ order: q.rows[0] });
    }
  } catch (err) {
    if (err instanceof Error)
      return res.status(400).send({ error: err.message });
    return res.status(400).send(err);
  }
};
