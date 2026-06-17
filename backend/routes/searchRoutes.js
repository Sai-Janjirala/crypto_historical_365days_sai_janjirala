const express = require("express");
const searchController = require("../controllers/searchController");

const router = express.Router();

router.get("/coins", searchController.searchCoins);
router.options("/coins", (req, res) => res.set("Allow", "GET,OPTIONS").sendStatus(204));

module.exports = router;
