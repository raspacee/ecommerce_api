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
  adminAuth.admin_auth,
  adminValidator.admin_create_product_validator,
  adminController.admin_create_product
);

/* Delete a product */
router.delete(
  "/product",
  adminAuth.admin_auth,
  adminValidator.admin_delete_product_validator,
  adminController.admin_delete_product
);

/* Update a product information */
router.put(
  "/product",
  adminAuth.admin_auth,
  adminValidator.admin_delete_product_validator,
  adminController.admin_update_product
);

/* Add new shipper */
router.post(
  "/shipper",
  adminAuth.admin_auth,
  adminValidator.admin_create_shipper_validator,
  adminController.admin_create_shipper
);

/* Add new supplier */
router.post(
  "/supplier",
  adminAuth.admin_auth,
  adminValidator.admin_create_supplier_validator,
  adminController.admin_create_supplier
);

/* Ship a order */
router.post(
  "/order/ship",
  adminAuth.admin_auth,
  adminValidator.admin_ship_order_validator,
  adminController.admin_ship_order
);

/* Indicate that a order has been received by the customer */
router.put(
  "/order/ship",
  adminAuth.admin_auth,
  adminValidator.admin_fulfill_order_validator,
  adminController.admin_fulfill_order
);

module.exports = router;
