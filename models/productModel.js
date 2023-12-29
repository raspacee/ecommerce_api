const { query } = require("../db/index.js");

exports.get_product_by_id = async (product_id) => {
  const text = "select * from product where product_id=$1";
  return query(text, [product_id]);
};

exports.update_stock = async (client, remaining_stock, product_id) => {
  return client.query("update product set stock_unit=$1 where product_id=$2", [
    remaining_stock,
    product_id,
  ]);
};

exports.create_product = async (
  product_name,
  product_category,
  unit_price,
  stock_unit,
  description,
  supplier_id,
  available_size,
  available_color,
  unit_weight,
  date
) => {
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
    date,
  ];
  return query(text, values);
};

exports.delete_by_id = async (product_id) => {
  return query("delete from product where product_id=$1", [product_id]);
};

exports.update_product = async (
  product_id,
  product_name,
  product_category,
  unit_price,
  stock_unit,
  description,
  available_size,
  available_color,
  unit_weight
) => {
  return query(
    "update product set product_name=$1, product_category=$2, unit_price=$3, \
      stock_unit=$4, description=$5, available_size=$6, available_color=$7, unit_weight=$8 \
      where product_id=$9",
    [
      product_name,
      product_category,
      unit_price,
      stock_unit,
      description,
      available_size,
      available_color,
      unit_weight,
      product_id,
    ]
  );
};
