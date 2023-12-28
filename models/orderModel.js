const { query } = require("../db/index.js");

exports.create_order = async (
  client,
  product_id,
  quantity,
  date,
  cart_id,
  cost
) => {
  return client.query(
    "insert into order_ (product_id, order_unit, created_at, cart_id, cost) \
          values ($1,$2,$3,$4,$5) returning *",
    [product_id, quantity, date, cart_id, cost]
  );
};

exports.inner_join_product = async (cart_id) => {
  let text =
    "select p.product_name, o.order_unit, p.unit_price, (p.unit_price * o.order_unit) as cost \
        from order_ o inner join product p on o.product_id = p.product_id where o.cart_id = $1;";
  return query(text, [cart_id]);
};
