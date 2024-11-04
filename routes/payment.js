const express = require("express");
const router = express.Router();

const paymentControllers = require("../controllers/payment");


// Routes related to sending email
router.post("/create-order", paymentControllers.create_order);

router.post("/verify-payment", paymentControllers.verify_payment);

module.exports = router;