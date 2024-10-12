const User = require('../models/user');
const Otp = require('../models/otp');
const UserTryLogin = require('../models/user_try_login');
const UserTrySignup = require('../models/user_try_signup');
const Service = require('../models/service');
const Order = require('../models/order');
const Status = require('../models/status');
const Contact = require('../models/contact');
const CouponCode = require('../models/coupon');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Set up email transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: { user: process.env.EMAIL_SENDER, pass: process.env.EMAIL_PASS }
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
exports.addUser = async (req, res) => {
    const { name, email, phone_code, phone_number, address,location } = req.body;

    try {
        const newUser = new User({ name, email, phone_code, phone_number, address,location });
        await newUser.save();

        // Generate JWT token
        const token = jwt.sign({ userId: newUser._id, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({
            success: true,
            message: 'User added successfully',
            user: newUser,
            token // Include the token in the response
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
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
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
        res.status(201).json({ success: true, message: 'Login attempt recorded', loginAttempt });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addUserTrySignup = async (req, res) => {
    const { email, location } = req.body;

    try {
        const signupAttempt = new UserTrySignup({ email, location });
        await signupAttempt.save();
        res.status(201).json({ success: true, message: 'Signup attempt recorded', signupAttempt });
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
            subject: 'Your OTP',
            text: `Your OTP is ${otp}`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'OTP sent' });
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
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
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
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const orders = await Order.find({ user_id: user._id }).populate('service_id');
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 7. Get a User by ID
exports.getUserById = async (req, res) => {
    const { id } = req.params; // Get user ID from request parameters

    try {
        // Find the user by ID
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
