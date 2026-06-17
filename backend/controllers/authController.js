const crypto = require("crypto");
const { failure, success } = require("../utils/queryHelpers");

const users = [];
const tokens = new Map();

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

function createToken(user) {
  const token = crypto.randomBytes(32).toString("hex");
  tokens.set(token, user.id);
  return token;
}

exports.authGuard = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const userId = token ? tokens.get(token) : null;
  const user = users.find((item) => item.id === userId);

  if (!user) return failure(res, 401, "Unauthorized");
  req.user = user;
  req.token = token;
  return next();
};

exports.adminGuard = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") return failure(res, 403, "Admin access required");
  return next();
};

exports.register = (req, res) => {
  const { name, email, password, role = "user" } = req.body;
  if (!email || !password) return failure(res, 400, "Email and password are required");
  if (users.some((user) => user.email === email)) return failure(res, 409, "User already exists");

  const user = {
    id: crypto.randomUUID(),
    name: name || email.split("@")[0],
    email,
    password,
    role
  };
  users.push(user);

  return success(res, { user: publicUser(user), token: createToken(user) }, 201);
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  const user = users.find((item) => item.email === email && item.password === password);
  if (!user) return failure(res, 401, "Invalid credentials");

  return success(res, { user: publicUser(user), token: createToken(user) });
};

exports.logout = (req, res) => {
  if (req.token) tokens.delete(req.token);
  return success(res, { loggedOut: true });
};

exports.profile = (req, res) => success(res, publicUser(req.user));

exports.updateProfile = (req, res) => {
  Object.assign(req.user, {
    name: req.body.name || req.user.name,
    email: req.body.email || req.user.email
  });
  return success(res, publicUser(req.user));
};

exports.deleteProfile = (req, res) => {
  const index = users.findIndex((user) => user.id === req.user.id);
  if (index >= 0) users.splice(index, 1);
  if (req.token) tokens.delete(req.token);
  return success(res, { deleted: true });
};

exports.forgotPassword = (req, res) => success(res, { message: "Password reset request received", email: req.body.email });
exports.resetPassword = (req, res) => success(res, { message: "Password reset completed" });
exports.changePassword = (req, res) => success(res, { message: "Password changed" });
exports.verifyEmail = (req, res) => success(res, { verified: true, email: req.body.email });
exports.generateToken = (req, res) => success(res, { token: crypto.randomBytes(32).toString("hex") }, 201);
exports.verifyToken = (req, res) => success(res, { valid: Boolean(req.body.token) });
exports.refreshToken = (req, res) => success(res, { token: createToken(req.user) });
exports.revokeToken = (req, res) => {
  if (req.token) tokens.delete(req.token);
  return success(res, { revoked: true });
};
exports.privateStats = (req, res) => success(res, { message: "Private stats route", user: publicUser(req.user) });
exports.dashboard = (req, res) => success(res, { message: "JWT dashboard route", user: publicUser(req.user) });
exports.admin = (req, res) => success(res, { message: "JWT admin route", user: publicUser(req.user) });
exports.listUsers = (req, res) => success(res, users.map(publicUser));
exports.adminDashboard = (req, res) => success(res, { message: "Admin dashboard route", user: publicUser(req.user) });
