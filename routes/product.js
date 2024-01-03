const router = require("express").Router();
const productController = require("../controllers/productController.js");
const paymentController = require("../controllers/paymentController.js");
const reviewController = require("../controllers/reviewController.js");
const productValidator = require("../validators/productValidator.js");
const reviewValidator = require("../validators/reviewValidator.js");
const userAuth = require("../auth/userAuth.js");

/* Place a order */
router.post(
  "/order",
  userAuth.user_auth,
  productValidator.place_order_validator,
  productController.place_order,
  paymentController.handle_payment
);

router.get("/order/verify/:cart_id", productController.verify_order);

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
router.get(
  "/:product_id",
  productValidator.get_product_validator,
  productController.get_product
);

/* Post a review on a product */
router.post(
  "/review",
  userAuth.user_auth,
  reviewValidator.create_review_validator,
  reviewController.create_review
);

/* Track a order */
router.get(
  "/order/:cart_id",
  userAuth.user_auth,
  productController.track_order
);

module.exports = router;
