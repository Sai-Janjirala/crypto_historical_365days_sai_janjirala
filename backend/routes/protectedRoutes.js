const express = require("express");
const coinController = require("../controllers/coinController");
const auth = require("../controllers/authController");

const router = express.Router();

router.post("/coins", auth.authGuard, coinController.createCoin);
router.patch("/coins/:id", auth.authGuard, coinController.updateCoin);
router.delete("/coins/:id", auth.authGuard, coinController.deleteCoin);

module.exports = router;
