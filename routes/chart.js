const express = require("express");
const router = express.Router();

// Get a piechart of top 10 selling products of all time
router.get("/top_selling/pie", (req, res, next) => {});

// Get a bargraph of top 10 selling products of all time
router.get("/top_selling/bar", (req, res, next) => {});

// Get a product's monthly sales bargraph over a specific year
router.get("/product/:product_id/:year", (req, res) => {});

module.exports = router;
