const express = require("express");
const router = express.Router();
const chartController = require("../controllers/chartController.js");

// Get a piechart of top 10 selling products of all time
router.get("/top_selling/pie", chartController.top_sellling_pie);

// Get a bargraph of top 10 selling products of all time
router.get("/top_selling/bar", chartController.top_sellling_bar);

// Get a product's monthly sales bargraph over a specific year
router.get("/product/:product_id/:year", (req, res) => {});

module.exports = router;
