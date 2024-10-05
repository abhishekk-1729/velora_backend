const express = require("express");
const router = express.Router();

const authControllers = require("../controllers/auth");

// Routes related to sending message
router.post("/loginOrSignup", authControllers.loginOrSignup);

// login
router.post("/verifyOtp", authControllers.verifyOtp);

module.exports = router;