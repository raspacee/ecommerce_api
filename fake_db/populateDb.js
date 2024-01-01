/* Run this file to populate the database with the
   fake data that I have generated to simulate a 
   ecommerce system
   The generated files are as follow:
        - products.csv(contains the fake product data)
*/

require("dotenv").config({ path: "../.env" });
const fs = require("fs");
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
});

async function populate_products(client, filename) {
  try {
    let data = fs.readFileSync(filename, "utf8");
    let rows = data.split("\n");
    let i;
    // Only populating 500 rows for now
    for (i = 1; i < rows.length - 500; i++) {
      let row = rows[i];
      let [name, category, price] = row.split(",");
      price = parseInt(price);
      let stock_unit = parseInt(Math.random() * 8000 + 2000);
      let unit_weight = parseInt(Math.random() * 50);
      const text =
        "insert into product (product_name, product_category, unit_price, stock_unit, \
    description, supplier_id, available_size, available_color, unit_weight, created_at) values \
    ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) returning *";
      const values = [
        name,
        category,
        price,
        stock_unit,
        null,
        1,
        null,
        null,
        unit_weight,
        new Date(),
      ];
      await client.query(text, values);
      console.log(`Added product #${i}`);
    }
  } catch (err) {
    console.error(err);
    await client.release();
    process.exit(-1);
  }
}

async function populate_users(client, filename) {
  try {
    let data = fs.readFileSync(filename, "utf8");
    let rows = data.split("\n");
    let i;
    for (i = 1; i < rows.length - 1; i++) {
      let row = rows[i];
      let [address, city, email, password, telephone, first_name, last_name] =
        row.split(",");
      const q = await client.query(
        "insert into user_address(address_line_1, city, country) \
                values ($1,$2,$3) returning *",
        [address, city, "Nepal"]
      );
      const q2 = await client.query(
        "insert into user_ (email, address_id, created_at, password, \
    telephone, first_name, last_name) values ($1, $2, $3, $4, $5, $6, $7)",
        [
          email,
          q.rows[0].address_id,
          new Date(),
          password,
          telephone,
          first_name,
          last_name,
        ]
      );
      console.log(`Added user #${i}`);
    }
  } catch (err) {
    console.error(err);
    await client.release();
    process.exit(-1);
  }
}

async function populate_cart(client) {
  try {
    for (let i = 1; i <= 4000; i++) {
      let user_id = await get_random_user_id(client);
      let product_id = await get_random_product_id(client);
      const date = random_date(
        new Date("2010-01-04T15:55:16.927+05:45"),
        new Date("2023-06-21T08:30:40.186+05:45"),
        0,
        23
      );

      // Create a cart first
      const c = await client.query(
        "insert into cart (created_at, fulfilled, ordered_by, total_cost) values ($1, $2, $3, 0) returning *",
        [date, true, user_id]
      );

      let order_cart = await generate_cart(client);
      let total_cost = 0;
      for (let item of order_cart) {
        const p = await client.query(
          "select stock_unit, unit_price from product where product_id=$1",
          [product_id]
        );
        // Create a order
        const o = await client.query(
          "insert into order_ (product_id, order_unit, created_at, cart_id, cost) \
          values ($1,$2,$3,$4,$5) returning *",
          [
            item.product_id,
            item.quantity,
            date,
            c.rows[0].cart_id,
            p.rows[0].unit_price * item.quantity,
          ]
        );
        const remaining_stock = p.rows[0].stock_unit - item.quantity;
        await client.query(
          "update product set stock_unit=$1 where product_id=$2",
          [remaining_stock, product_id]
        );
        total_cost += item.quantity * p.rows[0].unit_price;
      }
      await client.query("update cart set total_cost=$1 where cart_id=$2", [
        total_cost,
        c.rows[0].cart_id,
      ]);
      console.log(`Added cart #${i}`);
    }
  } catch (err) {
    console.error(err);
    await client.release();
    process.exit(-1);
  }
}

function random_date(start, end, startHour, endHour) {
  var date = new Date(+start + Math.random() * (end - start));
  var hour = (startHour + Math.random() * (endHour - startHour)) | 0;
  date.setHours(hour);
  return date;
}

async function get_random_user_id(client) {
  const q = await client.query(
    "SELECT user_id FROM user_ ORDER BY RANDOM() LIMIT 1"
  );
  return q.rows[0].user_id;
}

async function get_random_product_id(client) {
  const q = await client.query(
    "SELECT product_id FROM product ORDER BY RANDOM() LIMIT 1"
  );
  return q.rows[0].product_id;
}

async function generate_cart(client) {
  let no_of_order = parseInt(Math.random() * 5) + 1;
  let orders = [];
  let product_id, quantity;
  for (let i = 0; i < no_of_order; i++) {
    product_id = await get_random_product_id(client);
    quantity = parseInt(Math.random() * 4) + 1;
    orders.push({ product_id, quantity });
  }
  return orders;
}

/* Uncomment and run these functions below */

async function main() {
  const client = await pool.connect();
  client.query("start transaction");
  try {
    // const p1 = await populate_products(client, "./products.csv");
    // const p2 = await populate_users(client, "./users.csv");
    const p3 = await populate_cart(client);
    console.log("Successfully added all mock data");

    console.log("Making all changes permanent");
    client.query("end transaction");
  } catch (err) {
    console.error(err);
    console.log("Rolling back all changes");
    client.query("rollback");
  } finally {
    console.log("Releasing client");
    client.release();
  }
}

main();
