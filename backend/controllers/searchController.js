const Coin = require("../models/Coin");

exports.searchCoins = async (req, res) => {
  try {
    const keyword = req.query.q;

    if (!keyword) {
      return res.status(400).json({ success: false, message: "q query is required" });
    }

    const coins = await Coin.find({
      $or: [
        { coin_id: new RegExp(keyword, "i") },
        { coin_name: new RegExp(keyword, "i") },
        { symbol: new RegExp(keyword, "i") },
        { month: new RegExp(keyword, "i") },
        { date: new RegExp(keyword, "i") }
      ]
    }).limit(50);

    res.json({ success: true, count: coins.length, data: coins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
