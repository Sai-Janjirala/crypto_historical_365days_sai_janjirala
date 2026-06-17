const express = require("express");
const middlewareController = require("../controllers/middlewareController");

const router = express.Router();

router.get("/logger", middlewareController.loggerPractice);
router.get("/auth", middlewareController.authPractice);
router.get("/rate-limit", middlewareController.rateLimitPractice);
router.get("/error-handler", middlewareController.errorHandlerPractice);

module.exports = router;
