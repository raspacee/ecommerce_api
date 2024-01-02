const product = require("../models/productModel");
const { CustomError } = require("../helpers/errorHandler.js");
const { validationResult } = require("express-validator");
const { createHmac } = require("node:crypto");

exports.handle_payment = async (req, res, next) => {
  try {
    total_cost = req.total_cost;
    const transaction_uuid = uuidv4();
    const hmac = createHmac("sha256", "8gBm/:&EnhH.1/q");
    const data = hmac.update(
      `total_amount=${total_cost},transaction_uuid=${transaction_uuid},product_code=EPAYTEST`
    );
    const signature = data.digest("base64");
    let html = `
        <html>
            <body>
          <form action="https://rc-epay.esewa.com.np/api/epay/main/v2/form" method="POST">
              <input type="text" id="amount" name="amount" value="${total_cost}" required>
              <input type="text" id="tax_amount" name="tax_amount" value ="0" required>
              <input type="text" id="total_amount" name="total_amount" value="${total_cost}" required>
              <input type="text" id="transaction_uuid" name="transaction_uuid" value="${transaction_uuid}" required>
              <input type="text" id="product_code" name="product_code" value ="EPAYTEST" required>
              <input type="text" id="product_service_charge" name="product_service_charge" value="0" required>
              <input type="text" id="product_delivery_charge" name="product_delivery_charge" value="0" required>
              <input type="text" id="success_url" name="success_url" 
              value="http://localhost:3000/api/product/order/verify/${req.cart_id}" required>
              <input type="text" id="failure_url" name="failure_url" value="https://google.com" required>
              <input type="text" id="signed_field_names" name="signed_field_names" value="total_amount,transaction_uuid,product_code" required>
              <input type="text" id="signature" name="signature" value="${signature}" required>
              <input value="Submit" type="submit">
          </form>
          </body>
          </html>
          `;

    res.setHeader("content-type", "text/html");
    return res.status(200).send(html);
  } catch (err) {
    next(err);
  }
};

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}
