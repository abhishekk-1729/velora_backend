const User = require("../models/user");
const Otp = require("../models/otp");
const UserTryLogin = require("../models/user_try_login");
const UserTrySignup = require("../models/user_try_signup");
const Service = require("../models/service");
const Order = require("../models/order");
const Status = require("../models/status");
const Contact = require("../models/contact");
const CouponCode = require("../models/coupon");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Set up email transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: { user: process.env.EMAIL_SENDER, pass: process.env.EMAIL_PASS },
});

// Utility function to generate OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};
// 670a5a6f5a73185716058ff4 order id
// user_id: 670a55ccd58a308b3280de46
// 1. Add a User
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzBhNTVjY2Q1OGEzMDhiMzI4MGRlNDYiLCJlbWFpbCI6ImFiaGlrcmlpdGRAZ21haWwuY29tIiwiaWF0IjoxNzI4NzMwNTcyLCJleHAiOjE3Mjg3MzQxNzJ9.ihGuQByhzTtjTMMXseW2xVK8Ki6eixzrJ2scd1i8eu0
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFiaGlrcmlpdGRAZ21haWwuY29tIiwiaWF0IjoxNzI4NzMwNjgyLCJleHAiOjE3Mjg3MzQyODJ9.L5wNbp1vJS0Xlnyue0_68TtdnDSeR2lYNRTG_NmKzJA
// const jwt = require('jsonwebtoken');
const Cashback = require("../models/cashback"); // Adjust the path as necessary

// Function to generate the referral code
function generateReferralCode(userEmail, userId) {
  const companyName = "TFW"; // Company name abbreviation
  const expirationCode = "NOV30"; // Expiration code
  const timestamp = Date.now(); // Current timestamp
  const randomPart = crypto.randomBytes(3).toString("hex"); // Generate a random 6-character hex string

  // Combine the email, user ID, timestamp, and random part for uniqueness
  const data = `${userEmail}${userId}${timestamp}${randomPart}`;

  // Generate the hash using SHA-256
  const hash = crypto.createHash("sha256").update(data).digest("hex");

  // Create the referral code by combining parts
  const referralCode = `${companyName}-${hash
    .slice(0, 8)
    .toUpperCase()}-${expirationCode}`; // Use the first 8 characters of the hash

  return referralCode; // Example output: `TFW-1A2B3C4D-NOV30`
}

// Updated addUser function
exports.addUser = async (req, res) => {
  const { name, email, phone_code, phone_number, address, location } = req.body;

  try {
    // Create a new user
    const newUser = new User({
      name,
      email,
      phone_code,
      phone_number,
      address,
      location,
    });
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Create cashback entry
    const cashbackPercent = 5; // Default cashback percentage
    const cashback = new Cashback({
      user_id: newUser._id,
      cashback_percent: cashbackPercent,
    });
    await cashback.save();

    // Generate the referral code
    const referralCode = generateReferralCode(email, newUser._id);

    // // Find the latest coupon code in the database to determine the next number
    // const lastCoupon = await CouponCode.findOne().sort({ _id: -1 }); // Get the latest coupon by ID
    // let couponCodeNumber = 1; // Default starting number

    // if (lastCoupon) {
    //     const lastCodeNumber = parseInt(lastCoupon.coupon_code.replace(/\D/g, ''), 10); // Extract number part
    //     couponCodeNumber = lastCodeNumber + 1; // Increment the number
    // }

    // // Generate the new coupon code
    // const couponCodeBase = "VELORA";
    // const couponCode = `${couponCodeBase}${String(couponCodeNumber).padStart(3, '0')}`; // Pad number to 3 digits

    // Set expiry date for the coupon code
    const expiryDate = new Date("2024-11-30"); // You can customize this date as needed

    // Create and save the new coupon code entry
    const newCouponCode = new CouponCode({
      coupon_code: referralCode,
      discount_percent: 5, // Default discount percentage
      cashback_id: cashback._id, // Link to cashback
      issued_date: new Date(), // Current date
      expiry_date: expiryDate,
    });

    await newCouponCode.save();

    // Respond to the client
    res.status(201).json({
      success: true,
      message: "User added successfully",
      user: newUser,
      token, // Include the JWT token in the response
      coupon_code: referralCode, // Include the new coupon code in the response
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get a User by email
exports.getUserByEmail = async (req, res) => {
  const { email } = req.params;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Add User Try Login and Signup Records
exports.addUserTryLogin = async (req, res) => {
  const { email, location } = req.body;

  try {
    const loginAttempt = new UserTryLogin({ email, location });
    await loginAttempt.save();
    res
      .status(201)
      .json({ success: true, message: "Login attempt recorded", loginAttempt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addUserTrySignup = async (req, res) => {
  const { email, location } = req.body;

  try {
    const signupAttempt = new UserTrySignup({ email, location });
    await signupAttempt.save();
    res
      .status(201)
      .json({
        success: true,
        message: "Signup attempt recorded",
        signupAttempt,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Send OTP via email
exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const otp = generateOTP();
    let otpRecord = await Otp.findOne({ email });

    if (otpRecord) {
      otpRecord.otp = otp;
      await otpRecord.save();
    } else {
      otpRecord = new Otp({ email, otp });
      await otpRecord.save();
    }

    const mailOptions = {
      from: process.env.EMAIL_SENDER,
      to: email,
      subject: "Your OTP",
      text: `Your OTP is ${otp}`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "OTP sent" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Verify OTP
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord || otpRecord.otp !== otp) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    await Otp.deleteOne({ email });

    res.status(200).json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Get all Orders via User's Email
exports.getAllOrdersByEmail = async (req, res) => {
  const { email } = req.params;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const orders = await Order.find({ user_id: user._id }).populate(
      "service_id"
    );
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Get a User by ID

exports.getUserById = async (req, res) => {
  // Get token from request headers
  const token = req.headers.authorization?.split(" ")[1]; // Expecting 'Bearer <token>'

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Authorization token is required" });
  }

  try {
    // Verify token and extract user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure you have the correct JWT secret in your environment variables
    const userId = decoded.userId; // Assuming 'userId' is encoded in the token

    // Find the user by the ID extracted from the token
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    // Handle token verification errors or other errors
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getOtpCreatedAt = async (req, res) => {
  const { email } = req.body; // Get email from query parameters

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Find the OTP record by email
    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
      return res
        .status(404)
        .json({ error: "OTP record not found for the given email" });
    }

    // Return the createdAt field
    res
      .status(200)
      .json({ email: otpRecord.email, createdAt: otpRecord.createdAt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
