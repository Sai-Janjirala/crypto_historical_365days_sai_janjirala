const express = require("express");
const stats = require("../controllers/statsController");

const router = express.Router();
const wrap = stats.statsErrorHandler;

router.get("/market-cap", wrap(stats.marketCap));
router.head("/market-cap", wrap(stats.marketCap));
router.get("/average-price", wrap(stats.averagePrice));
router.get("/average-volume", wrap(stats.averageVolume));
router.get("/highest-market-cap", wrap(stats.highestMarketCap));
router.get("/highest-volume", wrap(stats.highestVolume));
router.get("/top-gainers", wrap(stats.topGainers));
router.get("/top-losers", wrap(stats.topLosers));
router.get("/monthly-analysis", wrap(stats.monthlyAnalysis));
router.get("/coin-count", wrap(stats.coinCount));
router.get("/rank-distribution", wrap(stats.rankDistribution));
router.get("/price-distribution", wrap(stats.priceDistribution));
router.get("/volatility-distribution", wrap(stats.volatilityDistribution));
router.get("/market-summary", wrap(stats.marketSummary));
router.get("/daily-analysis", wrap(stats.dailyAnalysis));
router.get("/yearly-analysis", wrap(stats.yearlyAnalysis));

module.exports = router;
