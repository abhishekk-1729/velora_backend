const express = require("express");
const router = express.Router();

const authControllers = require("../controllers/auth");
const { validateEmailAndLocation, validateOtp } = require('../validators/auth');
// Routes related to sending message
router.post("/sendLoginOtp", validateEmailAndLocation, authControllers.sendLoginEmailOtp);
// router.post("/login/sendPhoneOtp", authControllers.sendLoginPhoneOtp);

//signup
router.post("/sendSignupOtp",validateEmailAndLocation, authControllers.sendSignupEmailOtp);
// router.post("/signup/sendPhoneOtp", authControllers.sendPhoneOtp);

// verify otp
router.post("/verifyOtp",validateOtp, authControllers.verifyOtpEmail);

// token verify
router.post("/verifyToken", authControllers.verifyToken);

module.exports = router;