const { query } = require("../db/index.js");

exports.create_cart = async (client, date, fulfilled, user_id) => {
  return client.query(
    "insert into cart (created_at, fulfilled, ordered_by, total_cost, verified, payment_id) values ($1, $2, $3, 0, null, null) returning *",
    [date, fulfilled, user_id]
  );
};

exports.update_total_cost = async (client, total_cost, cart_id) => {
  return client.query("update cart set total_cost=$1 where cart_id=$2", [
    total_cost,
    cart_id,
  ]);
};

exports.get_cart_by_id = async (cart_id) => {
  return query("select * from cart where cart_id=$1", [cart_id]);
};

exports.inner_join_shipper = async (cart_id) => {
  return query(
    "select s.name as shipper_name, s.telephone as shipper_tele, s.email as shipper_email, \
        c.shipped_on, c.cart_id, c.created_at, c.fulfilled, c.is_cancelled, c.total_cost \
        from cart c inner join shipper s on c.shipper_id=s.shipper_id where c.cart_id=$1",
    [cart_id]
  );
};

// Get all orders made by a user
exports.get_all_orders = async (user_id) => {
  const carts = await query("select * from cart where ordered_by=$1", [
    user_id,
  ]);
  if (carts.rowCount == 0) return [];
  let orders = [];
  for (let c of carts.rows) {
    const c_id = c.cart_id;
    const o = await query("select * from order_ where cart_id=$1", [c_id]);
    c.orders = o.rows;
    orders.push(c);
  }
  return orders;
};

// Verify a cart
exports.verify_cart = async (cart_id, payment_id) => {
  return query(
    "update cart set verified=true, payment_id=$1 where cart_id=$2",
    [payment_id, cart_id]
  );
};
