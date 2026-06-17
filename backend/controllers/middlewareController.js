const { success } = require("../utils/queryHelpers");

exports.loggerPractice = (req, res) => success(res, { message: "Logger middleware practice route", method: req.method, path: req.originalUrl });
exports.authPractice = (req, res) => success(res, { message: "Authentication middleware practice route" });
exports.rateLimitPractice = (req, res) => success(res, { message: "Rate limiting middleware practice route" });
exports.errorHandlerPractice = (req, res) => {
  throw new Error("Practice global error middleware route");
};
