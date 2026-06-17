const express = require("express");
const analytics = require("../controllers/analyticsController");

const router = express.Router();
const wrap = analytics.analyticsErrorHandler;

router.get("/price/highest", wrap(analytics.highestPrice));
router.head("/price/highest", wrap(analytics.highestPrice));
router.get("/price", wrap(analytics.priceSummary));
router.get("/price/lowest", wrap(analytics.lowestPrice));
router.get("/price/average", wrap(analytics.averagePrice));
router.get("/price/history/:coinId", wrap(analytics.priceHistory));
router.get("/price/trend", wrap(analytics.priceTrend));
router.get("/price/growth", wrap(analytics.priceGrowth));
router.get("/price/drop", wrap(analytics.priceDrop));
router.get("/volume/highest", wrap(analytics.highestVolume));
router.get("/volume/lowest", wrap(analytics.lowestVolume));
router.get("/volume/average", wrap(analytics.averageVolume));
router.get("/volume/spike", wrap(analytics.volumeSpike));
router.get("/returns/top", wrap(analytics.topReturns));
router.get("/returns/negative", wrap(analytics.negativeReturns));
router.get("/returns/cumulative", wrap(analytics.cumulativeReturns));
router.get("/volatility/high", wrap(analytics.highVolatility));

module.exports = router;
