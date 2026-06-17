const express = require("express");
const coinController = require("../controllers/coinController");
const statsController = require("../controllers/statsController");
const auth = require("../controllers/authController");

const router = express.Router();

router.get("/coins", auth.authGuard, auth.adminGuard, coinController.getAllCoins);
router.options("/coins", (req, res) => res.set("Allow", "GET,OPTIONS").sendStatus(204));
router.get("/stats", auth.authGuard, auth.adminGuard, statsController.statsErrorHandler(statsController.marketSummary));
router.get("/dashboard", auth.authGuard, auth.adminGuard, auth.adminDashboard);
router.get("/users", auth.authGuard, auth.adminGuard, auth.listUsers);

module.exports = router;
