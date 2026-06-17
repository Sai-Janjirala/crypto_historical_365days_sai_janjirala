const Coin = require("../models/Coin");

const sendError = (res, error) => {
  res.status(500).json({ success: false, message: error.message });
};

exports.marketCap = async (req, res) => {
  try {
    const coins = await Coin.find();
    const total = coins.reduce((sum, coin) => sum + coin.market_cap, 0);
    res.json({ success: true, totalMarketCap: total });
  } catch (error) {
    sendError(res, error);
  }
};

exports.averagePrice = async (req, res) => {
  try {
    const coins = await Coin.find();
    const total = coins.reduce((sum, coin) => sum + coin.price, 0);
    const average = coins.length ? total / coins.length : 0;
    res.json({ success: true, averagePrice: average });
  } catch (error) {
    sendError(res, error);
  }
};

exports.averageVolume = async (req, res) => {
  try {
    const coins = await Coin.find();
    const total = coins.reduce((sum, coin) => sum + coin.volume, 0);
    const average = coins.length ? total / coins.length : 0;
    res.json({ success: true, averageVolume: average });
  } catch (error) {
    sendError(res, error);
  }
};

exports.highestMarketCap = async (req, res) => {
  try {
    const coin = await Coin.findOne().sort({ market_cap: -1 });
    res.json({ success: true, data: coin });
  } catch (error) {
    sendError(res, error);
  }
};

exports.highestVolume = async (req, res) => {
  try {
    const coin = await Coin.findOne().sort({ volume: -1 });
    res.json({ success: true, data: coin });
  } catch (error) {
    sendError(res, error);
  }
};

exports.topGainers = async (req, res) => {
  try {
    const coins = await Coin.find().sort({ daily_return: -1 }).limit(20);
    res.json({ success: true, data: coins });
  } catch (error) {
    sendError(res, error);
  }
};

exports.topLosers = async (req, res) => {
  try {
    const coins = await Coin.find().sort({ daily_return: 1 }).limit(20);
    res.json({ success: true, data: coins });
  } catch (error) {
    sendError(res, error);
  }
};

exports.monthlyAnalysis = async (req, res) => {
  try {
    const coins = await Coin.find();
    const months = {};

    coins.forEach((coin) => {
      if (!months[coin.month]) months[coin.month] = { records: 0, totalPrice: 0, totalVolume: 0 };
      months[coin.month].records += 1;
      months[coin.month].totalPrice += coin.price;
      months[coin.month].totalVolume += coin.volume;
    });

    res.json({ success: true, data: months });
  } catch (error) {
    sendError(res, error);
  }
};

exports.coinCount = async (req, res) => {
  try {
    const coinIds = await Coin.distinct("coin_id");
    res.json({ success: true, count: coinIds.length });
  } catch (error) {
    sendError(res, error);
  }
};

exports.rankDistribution = async (req, res) => {
  try {
    const coins = await Coin.find().sort({ market_cap_rank: 1 });
    res.json({ success: true, data: coins });
  } catch (error) {
    sendError(res, error);
  }
};

exports.priceDistribution = async (req, res) => {
  try {
    const coins = await Coin.find().sort({ price: 1 });
    res.json({ success: true, data: coins });
  } catch (error) {
    sendError(res, error);
  }
};

exports.volatilityDistribution = async (req, res) => {
  try {
    const coins = await Coin.find().sort({ volatility_7d: 1 });
    res.json({ success: true, data: coins });
  } catch (error) {
    sendError(res, error);
  }
};

exports.marketSummary = async (req, res) => {
  try {
    const coins = await Coin.find();
    const totalMarketCap = coins.reduce((sum, coin) => sum + coin.market_cap, 0);
    const totalVolume = coins.reduce((sum, coin) => sum + coin.volume, 0);

    res.json({
      success: true,
      records: coins.length,
      totalMarketCap,
      totalVolume
    });
  } catch (error) {
    sendError(res, error);
  }
};

exports.dailyAnalysis = async (req, res) => {
  try {
    const coins = await Coin.find().sort({ date: 1 });
    res.json({ success: true, data: coins });
  } catch (error) {
    sendError(res, error);
  }
};

exports.yearlyAnalysis = async (req, res) => {
  try {
    const coins = await Coin.find().sort({ date: 1 });
    res.json({ success: true, data: coins });
  } catch (error) {
    sendError(res, error);
  }
};

exports.statsErrorHandler = (controller) => {
  return async (req, res) => controller(req, res);
};
