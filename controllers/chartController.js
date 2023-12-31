const { query, pool } = require("../db/index.js");
const {
  get_product_sales,
  get_top_selling_products,
} = require("../helpers/statistics.js");

exports.top_sellling_pie = async (req, res, next) => {
  try {
    const row = await get_top_selling_products();

    let html = `<html><head><title>Pie Chart for top 10 sellling products</title>
        <body><div style="height: 600px; width: 800px;">
        <h2>Top 10 selling products of all time</h2>
        <p>Format: Product Name(Product ID)</p>
        <canvas id='myChart'></canvas></div>
        <script src='https://cdn.jsdelivr.net/npm/chart.js'></script>
        <script> const ctx = document.getElementById('myChart');
        new Chart(ctx, {
            type: 'pie',
            data: {
            labels: ${JSON.stringify(
              row.map((p) => p.product_name + "(" + p.product_id + ")")
            )},
            datasets: [{
                label: 'Total sales',
                data: [${row.map((p) => p.total_sales)}],
                borderWidth: 1
            }]
            },
            options: {
            scales: {
                y: {
                beginAtZero: true
                }
            }
            }
        });
        </script>
    </body>
    </html>`;
    res.setHeader("content-type", "text/html");
    return res.status(200).send(html);
  } catch (err) {
    next(err);
  }
};

exports.top_sellling_bar = async (req, res, next) => {
  try {
    const row = await get_top_selling_products();
    let html = `<html><head><title>Pie Chart for top 10 sellling products</title>
        <body><div style="height: 600px; width: 800px;">
        <h2>Top 10 selling products of all time</h2>
        <canvas id='myChart'></canvas></div>
        <script src='https://cdn.jsdelivr.net/npm/chart.js'></script>
        <script> const ctx = document.getElementById('myChart');
        new Chart(ctx, {
            type: 'bar',
            data: {
            labels: [${row.map((p) => p.product_id)}],
            datasets: [{
                label: 'Total sales',
                data: [${row.map((p) => p.total_sales)}],
                borderWidth: 1
            }]
            },
            options: {
            scales: {
                y: {
                beginAtZero: true
                }
            }
            }
        });
        </script>
    </body>
    </html>`;
    res.setHeader("content-type", "text/html");
    return res.status(200).send(html);
  } catch (err) {
    next(err);
  }
};
