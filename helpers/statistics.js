const { query } = require("../db/index.js");

// Gets the top 10 selling products
async function get_top_selling_products() {
  const q = await query(
    "select p.product_name, o.product_id, sum(o.order_unit) as total_sales from order_ o \
    inner join product p on p.product_id = o.product_id group by p.product_name, o.product_id \
    order by total_sales desc limit 10"
  );
  return q.rows;
}

// Gets the total sales of a product
async function get_product_sales(product_id) {
  const q = await query(
    "select sum(order_unit) as total_sales from order_ where product_id=$1",
    [product_id]
  );
  return q.rows[0].total_sales;
}

async function get_product_sales_over_year(product_id, year) {
  return query(
    "select to_char(to_date(m::TEXT, 'MM'),'Month') as month, \
      coalesce((select sum(order_unit) from order_ o where extract(month from o.created_at)=m and \
      extract(year from o.created_at)=$1 and product_id=$2 group by m), 0) as total_sales \
      from generate_series(1, 12) m",
    [year, product_id]
  );
}

// Gets the sales of a product starting from date till to date
async function get_product_sales_by_date(product_id, from, to) {}

module.exports = {
  get_product_sales,
  get_product_sales_by_date,
  get_top_selling_products,
  get_product_sales_over_year,
};
