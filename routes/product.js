const router = require("express").Router();
const productController = require("../controllers/productController.js");
const productValidator = require("../validators/productValidator.js");
const userAuth = require("../auth/userAuth.js");

/* Place a order */
router.post(
  "/order",
  userAuth.user_auth,
  productValidator.place_order_validator,
  productController.place_order
);

/* Cancel a order if the order is not shipped yet */
router.delete(
  "/order",
  userAuth.user_auth,
  productValidator.cancel_order_validator,
  productController.cancel_order
);

/* Search a product using query */
router.get("/search", productController.product_search);

/* Get top selling products */
router.get("/top_selling", (req, res) => {});

/* Get product categories */
router.get("/categories", (req, res) => {});

/* Get products by its category */
router.get("/categories/:category", (req, res) => {});

/* Get all information about a product */
router.get("/:product_id", (req, res) => {});

/* Post a review on a product */
router.post("/review", (req, res) => {});

/* Track a order */
router.get("/order/:order_id", (req, res) => {});

module.exports = router;
