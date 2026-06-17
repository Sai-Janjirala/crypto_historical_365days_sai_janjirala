const Coin = require("../models/Coin");

const sendError = (res, status, message) => {
  res.status(status).json({ success: false, message });
};

const cleanCoinData = (data) => {
  const coin = { ...data };
  const numberFields = [
    "market_cap_rank",
    "price",
    "market_cap",
    "volume",
    "daily_return",
    "price_ma7",
    "price_ma30",
    "volatility_7d",
    "cumulative_return"
  ];

  numberFields.forEach((field) => {
    if (coin[field] === "") coin[field] = null;
    if (coin[field] !== undefined && coin[field] !== null) coin[field] = Number(coin[field]);
  });

  if (coin.symbol) coin.symbol = coin.symbol.toUpperCase();
  if (coin.timestamp) coin.timestamp = new Date(coin.timestamp);

  return coin;
};

const findCoinById = async (id) => {
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    const coin = await Coin.findById(id);
    if (coin) return coin;
  }

  return Coin.findOne({ coin_id: id });
};

const getPageOptions = (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const getSort = (query) => {
  const sort = query.sort;
  if (!sort) return { timestamp: -1 };

  const fields = {
    price: "price",
    volume: "volume",
    marketCap: "market_cap",
    rank: "market_cap_rank",
    dailyReturn: "daily_return",
    volatility: "volatility_7d",
    cumulativeReturn: "cumulative_return",
    timestamp: "timestamp",
    month: "month",
    name: "coin_name"
  };

  return fields[sort] ? { [fields[sort]]: 1 } : { timestamp: -1 };
};

const sendCoins = async (req, res, filter = {}, sort = null) => {
  const { page, limit, skip } = getPageOptions(req.query);
  const coins = await Coin.find(filter).sort(sort || getSort(req.query)).skip(skip).limit(limit);
  res.json({ success: true, page, limit, count: coins.length, data: coins });
};

exports.getAllCoins = async (req, res) => {
  try {
    const filter = {};

    if (req.query.symbol) filter.symbol = req.query.symbol.toUpperCase();
    if (req.query.month) filter.month = req.query.month;
    if (req.query.rank) filter.market_cap_rank = Number(req.query.rank);
    if (req.query.price) filter.price = Number(req.query.price);
    if (req.query.volume) filter.volume = Number(req.query.volume);
    if (req.query.marketCap) filter.market_cap = Number(req.query.marketCap);
    if (req.query.dailyReturn) filter.daily_return = Number(req.query.dailyReturn);
    if (req.query.volatility) filter.volatility_7d = Number(req.query.volatility);

    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    await sendCoins(req, res, filter);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.getCoinById = async (req, res) => {
  try {
    const id = req.params.id || req.params.coinId;
    const coin = await findCoinById(id);
    if (!coin) return sendError(res, 404, "Coin not found");

    res.json({ success: true, data: coin });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.createCoin = async (req, res) => {
  try {
    const coin = await Coin.create(cleanCoinData(req.body));
    res.status(201).json({ success: true, data: coin });
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

exports.replaceCoin = async (req, res) => {
  try {
    const coin = await Coin.findOneAndReplace(
      { coin_id: req.params.id },
      cleanCoinData(req.body),
      { new: true, runValidators: true }
    );

    if (!coin) return sendError(res, 404, "Coin not found");
    res.json({ success: true, data: coin });
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

exports.updateCoin = async (req, res) => {
  try {
    const coin = await Coin.findOneAndUpdate(
      { coin_id: req.params.id },
      cleanCoinData(req.body),
      { new: true, runValidators: true }
    );

    if (!coin) return sendError(res, 404, "Coin not found");
    res.json({ success: true, data: coin });
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

exports.deleteCoin = async (req, res) => {
  try {
    const coin = await Coin.findOneAndDelete({ coin_id: req.params.id });
    if (!coin) return sendError(res, 404, "Coin not found");

    res.json({ success: true, message: "Coin deleted", data: coin });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.coinExists = async (req, res) => {
  try {
    const coin = await findCoinById(req.params.id);
    res.json({ success: true, exists: Boolean(coin) });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.bulkCreateCoins = async (req, res) => {
  try {
    const records = Array.isArray(req.body) ? req.body : req.body.records;
    const coins = await Coin.insertMany(records.map(cleanCoinData));
    res.status(201).json({ success: true, count: coins.length, data: coins });
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

exports.bulkUpdateCoins = async (req, res) => {
  try {
    const records = req.body.records || [];

    for (const record of records) {
      await Coin.findOneAndUpdate(
        { coin_id: record.coin_id || record.id },
        cleanCoinData(record.data || record),
        { new: true }
      );
    }

    res.json({ success: true, message: "Bulk update completed" });
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

exports.bulkDeleteCoins = async (req, res) => {
  try {
    const result = await Coin.deleteMany({ coin_id: { $in: req.body.ids || [] } });
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.getByName = async (req, res) => {
  try {
    await sendCoins(req, res, { coin_name: new RegExp(req.params.coinName || req.params.name, "i") });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.getBySymbol = async (req, res) => {
  try {
    await sendCoins(req, res, { symbol: req.params.symbol.toUpperCase() });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.getByRank = async (req, res) => {
  try {
    await sendCoins(req, res, { market_cap_rank: Number(req.params.rank) });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.getByMonth = async (req, res) => {
  try {
    await sendCoins(req, res, { month: req.params.month });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.getByDate = async (req, res) => {
  try {
    await sendCoins(req, res, { date: req.params.date });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.getLatest = async (req, res) => {
  try {
    const latest = await Coin.findOne().sort({ timestamp: -1 });
    if (!latest) return res.json({ success: true, data: [] });
    await sendCoins(req, res, { date: latest.date }, { market_cap_rank: 1 });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.getHistory = async (req, res) => {
  try {
    const filter = { coin_id: req.params.coinId };
    if (req.params.month) filter.month = req.params.month;
    await sendCoins(req, res, filter, { timestamp: 1 });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.getTopMarketCap = async (req, res) => sendCoins(req, res, {}, { market_cap: -1 });
exports.getTopVolume = async (req, res) => sendCoins(req, res, {}, { volume: -1 });
exports.getTopGainers = async (req, res) => sendCoins(req, res, {}, { daily_return: -1 });
exports.getTopLosers = async (req, res) => sendCoins(req, res, {}, { daily_return: 1 });
exports.getOldest = async (req, res) => sendCoins(req, res, {}, { timestamp: 1 });
exports.getNewest = async (req, res) => sendCoins(req, res, {}, { timestamp: -1 });
exports.getTrending = async (req, res) => sendCoins(req, res, { daily_return: { $gt: 0 } }, { volume: -1 });
exports.getRecent = async (req, res) => sendCoins(req, res, {}, { updatedAt: -1 });
exports.getPrice = async (req, res) => sendCoins(req, res, { coin_id: req.params.coinId }, { timestamp: -1 });
exports.getMarketCapDetails = async (req, res) => sendCoins(req, res, { coin_id: req.params.coinId }, { market_cap: -1 });
exports.getVolumeDetails = async (req, res) => sendCoins(req, res, { coin_id: req.params.coinId }, { volume: -1 });
exports.getReturns = async (req, res) => sendCoins(req, res, { coin_id: req.params.coinId }, { cumulative_return: -1 });
exports.getVolatility = async (req, res) => sendCoins(req, res, { coin_id: req.params.coinId }, { volatility_7d: -1 });

exports.getPerformance = async (req, res) => {
  try {
    const coins = await Coin.find({ coin_id: req.params.coinId }).sort({ timestamp: 1 });
    if (coins.length === 0) return sendError(res, 404, "No records found");

    const first = coins[0];
    const last = coins[coins.length - 1];

    res.json({
      success: true,
      data: {
        coin_id: req.params.coinId,
        first_price: first.price,
        latest_price: last.price,
        price_change: last.price - first.price,
        records: coins.length
      }
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.compareCoins = async (req, res) => {
  try {
    const ids = [req.params.coin1, req.params.coin2, req.params.coin3].filter(Boolean);
    const coins = await Coin.find({ coin_id: { $in: ids } }).sort({ timestamp: -1 });
    res.json({ success: true, data: coins });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.sortByPreset = async (req, res) => {
  const sortOptions = {
    "price-asc": { price: 1 },
    "price-desc": { price: -1 },
    "volume-desc": { volume: -1 },
    "rank-asc": { market_cap_rank: 1 },
    "return-desc": { daily_return: -1 }
  };

  await sendCoins(req, res, {}, sortOptions[req.params.preset] || { timestamp: -1 });
};

exports.filterPreset = async (req, res) => {
  const filters = {
    "high-price": { price: { $gte: 100 } },
    "low-price": { price: { $lt: 100 } },
    "high-volume": { volume: { $gte: 1000000 } },
    "low-volume": { volume: { $lt: 1000000 } },
    "high-market-cap": { market_cap: { $gte: 1000000000 } },
    "low-market-cap": { market_cap: { $lt: 1000000000 } },
    "high-volatility": { volatility_7d: { $gte: 10 } },
    "low-volatility": { volatility_7d: { $lt: 10 } },
    "high-return": { daily_return: { $gt: 0 } },
    "negative-return": { daily_return: { $lt: 0 } },
    bullish: { daily_return: { $gt: 0 } },
    bearish: { daily_return: { $lt: 0 } },
    profitable: { cumulative_return: { $gt: 0 } },
    "loss-making": { cumulative_return: { $lt: 0 } },
    "missing-values": { $or: [{ daily_return: null }, { volatility_7d: null }, { cumulative_return: null }] }
  };

  await sendCoins(req, res, filters[req.params.type] || {});
};

exports.getRandom = async (req, res) => {
  try {
    const count = await Coin.countDocuments();
    const random = Math.floor(Math.random() * count);
    const coin = await Coin.findOne().skip(random);
    res.json({ success: true, data: coin });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.getRecommendations = async (req, res) => sendCoins(req, res, { daily_return: { $gt: 0 } }, { cumulative_return: -1 });
exports.getPredictions = async (req, res) => res.json({ success: true, message: "Prediction route is ready" });
exports.simulatePortfolio = async (req, res) => res.json({ success: true, message: "Portfolio simulation route is ready" });
exports.getHeatmap = async (req, res) => sendCoins(req, res, {}, { daily_return: -1 });
exports.getMarketStatus = async (req, res) => res.json({ success: true, status: "API is running" });
exports.getTopMonthlyPerformers = async (req, res) => sendCoins(req, res, {}, { cumulative_return: -1 });
exports.getTopYearlyPerformers = async (req, res) => sendCoins(req, res, {}, { cumulative_return: -1 });
exports.getHighVolatilityAlerts = async (req, res) => sendCoins(req, res, { volatility_7d: { $gte: 10 } }, { volatility_7d: -1 });
exports.getMarketDropAlerts = async (req, res) => sendCoins(req, res, { daily_return: { $lte: -5 } }, { daily_return: 1 });
exports.submitReport = async (req, res) => res.status(201).json({ success: true, message: "Report submitted", data: req.body });
exports.clearCache = async (req, res) => res.json({ success: true, message: "Cache cleared" });
exports.systemHealth = async (req, res) => res.json({ success: true, status: "healthy" });
exports.systemVersion = async (req, res) => res.json({ success: true, version: "1.0.0" });
exports.systemConfig = async (req, res) => res.json({ success: true, config: { defaultLimit: 20 } });

exports.exportJson = async (req, res) => {
  const coins = await Coin.find().limit(1000);
  res.json({ success: true, data: coins });
};

exports.exportCsv = async (req, res) => {
  const coins = await Coin.find().limit(1000);
  const header = "coin_id,coin_name,symbol,date,price,market_cap,volume,month";
  const rows = coins.map((coin) => {
    return `${coin.coin_id},${coin.coin_name},${coin.symbol},${coin.date},${coin.price},${coin.market_cap},${coin.volume},${coin.month}`;
  });

  res.setHeader("Content-Type", "text/csv");
  res.send([header, ...rows].join("\n"));
};
