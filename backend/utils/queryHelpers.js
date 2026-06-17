const numericFields = [
  "price",
  "volume",
  "market_cap",
  "market_cap_rank",
  "daily_return",
  "volatility_7d",
  "cumulative_return"
];

const sortMap = {
  price: "price",
  volume: "volume",
  marketCap: "market_cap",
  market_cap: "market_cap",
  rank: "market_cap_rank",
  dailyReturn: "daily_return",
  daily_return: "daily_return",
  volatility: "volatility_7d",
  cumulativeReturn: "cumulative_return",
  cumulative_return: "cumulative_return",
  timestamp: "timestamp",
  month: "month",
  name: "coin_name"
};

function toNumber(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const number = Number(value);
  return Number.isNaN(number) ? undefined : number;
}

function getPagination(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  return {
    page,
    limit,
    skip: (page - 1) * limit
  };
}

function buildCoinFilter(query = {}) {
  const filter = {};

  if (query.symbol) filter.symbol = String(query.symbol).toUpperCase();
  if (query.month) filter.month = query.month;

  const rank = toNumber(query.rank);
  if (rank !== undefined) filter.market_cap_rank = rank;

  const exactPrice = toNumber(query.price);
  if (exactPrice !== undefined) filter.price = exactPrice;

  const volume = toNumber(query.volume);
  if (volume !== undefined) filter.volume = volume;

  const marketCap = toNumber(query.marketCap);
  if (marketCap !== undefined) filter.market_cap = marketCap;

  const dailyReturn = toNumber(query.dailyReturn);
  if (dailyReturn !== undefined) filter.daily_return = dailyReturn;

  const volatility = toNumber(query.volatility);
  if (volatility !== undefined) filter.volatility_7d = volatility;

  const minPrice = toNumber(query.minPrice);
  const maxPrice = toNumber(query.maxPrice);
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  return filter;
}

function buildSort(query = {}, fallback = { timestamp: -1 }) {
  if (!query.sort) return fallback;

  const requestedSort = String(query.sort);
  const direction = requestedSort.startsWith("-") ? -1 : 1;
  const cleanSort = requestedSort.replace(/^-/, "");
  const field = sortMap[cleanSort];

  if (!field) return fallback;
  return { [field]: direction };
}

function normalizeCoinPayload(payload = {}) {
  const normalized = { ...payload };

  numericFields.forEach((field) => {
    if (normalized[field] === "") {
      normalized[field] = null;
    } else if (normalized[field] !== undefined) {
      normalized[field] = Number(normalized[field]);
    }
  });

  if (normalized.symbol) normalized.symbol = String(normalized.symbol).toUpperCase();
  if (normalized.timestamp) normalized.timestamp = new Date(normalized.timestamp);

  return normalized;
}

function success(res, data, status = 200, meta) {
  return res.status(status).json({
    success: true,
    ...(meta ? { meta } : {}),
    data
  });
}

function failure(res, status, message, details) {
  return res.status(status).json({
    success: false,
    message,
    ...(details ? { details } : {})
  });
}

module.exports = {
  buildCoinFilter,
  buildSort,
  failure,
  getPagination,
  normalizeCoinPayload,
  success,
  toNumber
};
