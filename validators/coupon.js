const { body } = require("express-validator");

// Validation for adding a new coupon
const validateAddCoupon = [
  body("coupon_code")
    .notEmpty()
    .withMessage("Coupon code is required")
    .isString()
    .withMessage("Coupon code must be a string")
    .isLength({ min: 5 })
    .withMessage("Coupon code must be at least 5 characters long"),
  body("discount_percent")
    .notEmpty()
    .withMessage("Discount percent is required")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Discount percent must be between 0 and 100"),
  body("expiry_date")
    .notEmpty()
    .withMessage("Expiry date is required")
    .isISO8601()
    .withMessage("Expiry date must be a valid date")
    // .custom((value, { req }) => {
    //   if (new Date(value) <= new Date.now) {
    //     throw new Error("Expiry date must be after the issued date");
    //   }
    //   return true;
    // }),
];

module.exports = { validateAddCoupon };
