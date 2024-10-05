const express = require("express");
const router = express.Router();

const authControllers = require("../controllers/auth");

// Routes related to sending message
router.post("/signUp", authControllers.signUp);

// login
router.post("/login", authControllers.login);

module.exports = router;