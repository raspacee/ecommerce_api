const router = require("express").Router();
const adminController = require("../controllers/adminController.js");
const adminValidator = require("../validators/adminValidator.js");
const adminAuth = require("../auth/adminAuth.js");

/* Admin Login */
router.post(
  "/login",
  adminValidator.admin_login_validator,
  adminController.admin_login
);

/* Add new product */
router.post(
  "/product",
  adminValidator.admin_create_product_validator,
  adminController.admin_create_product
);

/* Delete a product */
router.delete("/product", (req, res) => {});

/* Update a product information */
router.put("/product", (req, res) => {});

/* Add new shipper */
router.post("/shipper", (req, res) => {});

/* Add new supplier */
router.post(
  "/supplier",
  adminAuth.admin_auth,
  adminValidator.admin_create_supplier_validator,
  adminController.admin_create_supplier
);

module.exports = router;
