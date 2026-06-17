const express = require("express");
const auth = require("../controllers/authController");

const router = express.Router();

router.get("/profile", auth.authGuard, auth.profile);
router.options("/profile", (req, res) => res.set("Allow", "GET,OPTIONS").sendStatus(204));
router.get("/dashboard", auth.authGuard, auth.dashboard);
router.post("/generate-token", auth.generateToken);
router.post("/verify-token", auth.verifyToken);
router.get("/admin", auth.authGuard, auth.adminGuard, auth.admin);
router.get("/private-stats", auth.authGuard, auth.privateStats);
router.post("/refresh-token", auth.authGuard, auth.refreshToken);
router.delete("/revoke-token", auth.authGuard, auth.revokeToken);

module.exports = router;
