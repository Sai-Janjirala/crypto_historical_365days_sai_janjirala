const express = require("express");
const coinController = require("../controllers/coinController");

const router = express.Router();

router.get("/", coinController.getAllCoins);
router.post("/", coinController.createCoin);
router.post("/bulk-create", coinController.bulkCreateCoins);
router.patch("/bulk-update", coinController.bulkUpdateCoins);
router.delete("/bulk-delete", coinController.bulkDeleteCoins);

router.get("/exists/:id", coinController.coinExists);
router.get("/latest", coinController.getLatest);
router.get("/top-market-cap", coinController.getTopMarketCap);
router.get("/top-volume", coinController.getTopVolume);
router.get("/top-gainers", coinController.getTopGainers);
router.get("/top-losers", coinController.getTopLosers);
router.get("/oldest", coinController.getOldest);
router.get("/newest", coinController.getNewest);
router.get("/trending", coinController.getTrending);
router.get("/recent", coinController.getRecent);
router.get("/random", coinController.getRandom);
router.get("/recommendations", coinController.getRecommendations);
router.get("/predictions", coinController.getPredictions);
router.get("/portfolio/simulate", coinController.simulatePortfolio);
router.get("/heatmap", coinController.getHeatmap);
router.get("/market-status", coinController.getMarketStatus);
router.get("/performance/top-monthly", coinController.getTopMonthlyPerformers);
router.get("/performance/top-yearly", coinController.getTopYearlyPerformers);
router.get("/alerts/high-volatility", coinController.getHighVolatilityAlerts);
router.get("/alerts/market-drop", coinController.getMarketDropAlerts);
router.post("/report", coinController.submitReport);
router.get("/cache/clear", coinController.clearCache);
router.get("/system/health", coinController.systemHealth);
router.get("/system/version", coinController.systemVersion);
router.get("/system/config", coinController.systemConfig);
router.get("/export/json", coinController.exportJson);
router.get("/export/csv", coinController.exportCsv);

router.get("/name/:coinName", coinController.getByName);
router.get("/symbol/:symbol", coinController.getBySymbol);
router.get("/rank/:rank", coinController.getByRank);
router.get("/month/:month", coinController.getByMonth);
router.get("/date/:date", coinController.getByDate);
router.get("/history/:coinId/:month", coinController.getHistory);
router.get("/history/:coinId", coinController.getHistory);
router.get("/performance/:coinId", coinController.getPerformance);
router.get("/volatility/:coinId", coinController.getVolatility);
router.get("/market-cap/:coinId", coinController.getMarketCapDetails);
router.get("/volume/:coinId", coinController.getVolumeDetails);
router.get("/returns/:coinId", coinController.getReturns);
router.get("/compare/:coin1/:coin2/:coin3", coinController.compareCoins);
router.get("/compare/:coin1/:coin2", coinController.compareCoins);
router.get("/price/:coinId", coinController.getPrice);
router.get("/sort/:preset", coinController.sortByPreset);
router.get("/filter/:type", coinController.filterPreset);

router.head("/history/:coinId", coinController.getHistory);
router.head("/", coinController.getAllCoins);
router.head("/:coinId", coinController.getCoinById);
router.options("/", (req, res) => res.set("Allow", "GET,POST,HEAD,OPTIONS").sendStatus(204));
router.options("/:coinId", (req, res) => res.set("Allow", "GET,PUT,PATCH,DELETE,HEAD,OPTIONS").sendStatus(204));

router.get("/:id", coinController.getCoinById);
router.put("/:id", coinController.replaceCoin);
router.patch("/:id", coinController.updateCoin);
router.delete("/:id", coinController.deleteCoin);

module.exports = router;
