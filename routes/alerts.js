const express = require("express");
const router = express.Router();

const alertControllers = require("../controllers/alerts");

// Routes related to sending message
router.post("/sendMessage", alertControllers.sendMessage);

// Routes related to sending whatsapp message
// router.post("/sendWhatsappMessage", alertControllers.sendWhatsappMessage);

// Routes related to sending email
router.post("/sendEmail", alertControllers.sendEmail);

module.exports = router;