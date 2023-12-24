const router = require("express").Router();
const productController = require("../controllers/productController.js");

/* Place a order */
router.post("/order", (req, res) => {});

/* Cancel a order if the order is not fulfilled yet */
router.delete("/order", (req, res) => {});

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

module.exports = router;
