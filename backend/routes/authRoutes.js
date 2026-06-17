const express = require("express");
const auth = require("../controllers/authController");

const router = express.Router();

router.post("/register", auth.register);
router.post("/login", auth.login);
router.post("/logout", auth.authGuard, auth.logout);
router.get("/profile", auth.authGuard, auth.profile);
router.head("/profile", auth.authGuard, auth.profile);
router.patch("/profile", auth.authGuard, auth.updateProfile);
router.delete("/profile", auth.authGuard, auth.deleteProfile);
router.post("/forgot-password", auth.forgotPassword);
router.post("/reset-password", auth.resetPassword);
router.post("/change-password", auth.authGuard, auth.changePassword);
router.post("/verify-email", auth.verifyEmail);
router.options("/login", (req, res) => res.set("Allow", "POST,OPTIONS").sendStatus(204));

module.exports = router;
