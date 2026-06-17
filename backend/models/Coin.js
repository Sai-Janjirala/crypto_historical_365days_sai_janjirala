const mongoose = require("mongoose");

const coinSchema = new mongoose.Schema(
  {
    coin_id: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    coin_name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    symbol: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true
    },
    market_cap_rank: {
      type: Number,
      index: true
    },
    timestamp: {
      type: Date,
      index: true
    },
    date: {
      type: String,
      required: true,
      index: true
    },
    price: {
      type: Number,
      required: true,
      index: true
    },
    market_cap: {
      type: Number,
      default: 0,
      index: true
    },
    volume: {
      type: Number,
      default: 0,
      index: true
    },
    daily_return: {
      type: Number,
      default: null,
      index: true
    },
    price_ma7: {
      type: Number,
      default: null
    },
    price_ma30: {
      type: Number,
      default: null
    },
    volatility_7d: {
      type: Number,
      default: null,
      index: true
    },
    cumulative_return: {
      type: Number,
      default: null,
      index: true
    },
    month: {
      type: String,
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

coinSchema.index({ coin_id: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Coin", coinSchema);
