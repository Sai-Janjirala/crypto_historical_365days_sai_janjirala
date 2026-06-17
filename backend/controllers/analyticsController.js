const Coin = require("../models/Coin");

const sendError = (res, error) => {
  res.status(500).json({ success: false, message: error.message });
};

exports.highestPrice = async (req, res) => {
  try {
    const coin = await Coin.findOne().sort({ price: -1 });
    res.json({ success: true, data: coin });
  } catch (error) {
    sendError(res, error);
  }
};

exports.lowestPrice = async (req, res) => {
  try {
    const coin = await Coin.findOne().sort({ price: 1 });
    res.json({ success: true, data: coin });
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

exports.priceHistory = async (req, res) => {
  try {
    const coins = await Coin.find({ coin_id: req.params.coinId }).sort({ timestamp: 1 });
    res.json({ success: true, data: coins });
  } catch (error) {
    sendError(res, error);
  }
};

exports.priceTrend = async (req, res) => {
  try {
    const coins = await Coin.find().sort({ timestamp: -1 }).limit(50);
    res.json({ success: true, data: coins });
  } catch (error) {
    sendError(res, error);
  }
};

exports.priceGrowth = async (req, res) => {
  try {
    const coins = await Coin.find({ daily_return: { $gt: 0 } }).sort({ daily_return: -1 }).limit(20);
    res.json({ success: true, data: coins });
  } catch (error) {
    sendError(res, error);
  }
};

exports.priceDrop = async (req, res) => {
  try {
    const coins = await Coin.find({ daily_return: { $lt: 0 } }).sort({ daily_return: 1 }).limit(20);
    res.json({ success: true, data: coins });
  } catch (error) {
    sendError(res, error);
  }
};

exports.highestVolume = async (req, res) => {
  try {
    const coins = await Coin.find().sort({ volume: -1 }).limit(20);
    res.json({ success: true, data: coins });
  } catch (error) {
    sendError(res, error);
  }
};

exports.lowestVolume = async (req, res) => {
  try {
    const coins = await Coin.find().sort({ volume: 1 }).limit(20);
    res.json({ success: true, data: coins });
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

exports.volumeSpike = async (req, res) => {
  try {
    const coins = await Coin.find().sort({ volume: -1 }).limit(20);
    res.json({ success: true, data: coins });
  } catch (error) {
    sendError(res, error);
  }
};

exports.topReturns = async (req, res) => {
  try {
    const coins = await Coin.find().sort({ daily_return: -1 }).limit(20);
    res.json({ success: true, data: coins });
  } catch (error) {
    sendError(res, error);
  }
};

exports.negativeReturns = async (req, res) => {
  try {
    const coins = await Coin.find({ daily_return: { $lt: 0 } }).sort({ daily_return: 1 }).limit(20);
    res.json({ success: true, data: coins });
  } catch (error) {
    sendError(res, error);
  }
};

exports.cumulativeReturns = async (req, res) => {
  try {
    const coins = await Coin.find().sort({ cumulative_return: -1 }).limit(20);
    res.json({ success: true, data: coins });
  } catch (error) {
    sendError(res, error);
  }
};

exports.highVolatility = async (req, res) => {
  try {
    const coins = await Coin.find().sort({ volatility_7d: -1 }).limit(20);
    res.json({ success: true, data: coins });
  } catch (error) {
    sendError(res, error);
  }
};

exports.priceSummary = async (req, res) => {
  try {
    const highest = await Coin.findOne().sort({ price: -1 });
    const lowest = await Coin.findOne().sort({ price: 1 });
    res.json({ success: true, highest, lowest });
  } catch (error) {
    sendError(res, error);
  }
};

exports.analyticsErrorHandler = (controller) => {
  return async (req, res) => controller(req, res);
};
