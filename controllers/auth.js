const User = require('../models/user');
const Otp = require('../models/otp');
const UserTryLogin = require('../models/user_try_login');
const UserTrySignup = require('../models/user_try_signup');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { validationResult } = require('express-validator');

// Set up email transporter
const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',  // Replace with your SMTP host
        port: 587,                 // Port (587 is typically used for secure connections)
        secure: false,             // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_SENDER, // Your SMTP username
            pass: process.env.EMAIL_PASS,    // Your SMTP password
        },
    });

// Utility function to generate OTP
const generateMagicCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let magicCode = '';
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        magicCode += characters[randomIndex];
    }
    return magicCode;
};


// Send login OTP
const sendLoginEmailOtp = async (req, res) => {
    const { email, location } = req.body;

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const otp = generateMagicCode();
        let otpRecord = await Otp.findOne({ email });

        if (otpRecord) {
            otpRecord.otp = otp;
            otpRecord.createdAt = Date.now(); // reset the timestamp
            await otpRecord.save();
        } else {
            otpRecord = new Otp({ email, otp });
            await otpRecord.save();
        }

        // Log user try login attempt
        const userTryLogin = new UserTryLogin({ email, location });
        await userTryLogin.save();

        // Send OTP email
const mailOptions = {
            from: process.env.EMAIL_SENDER,
            to: email,
            subject: 'Your Magic Code for The First Web Login',
            text: `Dear user, your magic code for login is ${otp}. It will expire in 5 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; border-radius: 8px;">
                    <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
                        <h2 style="color: #333333;">Welcome to The First Web!</h2>
                        <p style="font-size: 16px; color: #555555;">
                            Dear user,
                        </p>
                        <p style="font-size: 16px; color: #555555;">
                            Your Magic Code for login is:
                        </p>
                        <h1 style="font-size: 24px; color: #007BFF; text-align: center; margin: 20px 0;">
                            ${otp}
                        </h1>
                        <p style="font-size: 16px; color: #555555;">
                            This code is valid for 5 minutes. Please enter it in the provided field to complete your login process.
                        </p>
                        <p style="font-size: 16px; color: #555555;">
                            If you did not request this code, please ignore this email or contact our support team.
                        </p>
                        <hr style="border: 1px solid #dddddd;">
                        <p style="font-size: 14px; color: #777777; text-align: center;">
                            Best Regards,<br>
                            <strong>The First Web Support Team</strong>
                        </p>
                        <p style="font-size: 12px; color: #aaaaaa; text-align: center;">
                            This is an automated message. Please do not reply to this email. For any inquiries, contact us at 
                            <a href="mailto:support@thefirstweb.com" style="color: #007BFF; text-decoration: none;">support@thefirstweb.com</a>.
                        </p>
                    </div>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Login OTP sent' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Send signup OTP
const sendSignupEmailOtp = async (req, res) => {
    const { email, location } = req.body;

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const otp = generateMagicCode();
        let otpRecord = await Otp.findOne({ email });

        if (otpRecord) {
            otpRecord.otp = otp;
            otpRecord.createdAt = Date.now(); // reset the timestamp
            await otpRecord.save();
        } else {
            otpRecord = new Otp({ email, otp });
            await otpRecord.save();
        }

        // Log user try signup attempt
        const userTrySignup = new UserTrySignup({ email, location });
        await userTrySignup.save();

        // Send OTP email
        const mailOptions = {
            from: process.env.EMAIL_SENDER,
            to: email,
            subject: 'Your Magic Code for The First Web Signup',
            text: `Dear user, your magic code for signup is ${otp}. It will expire in 5 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; border-radius: 8px;">
                    <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
                        <h2 style="color: #333333;">Welcome to The First Web!</h2>
                        <p style="font-size: 16px; color: #555555;">
                            Dear user,
                        </p>
                        <p style="font-size: 16px; color: #555555;">
                            Your Magic Code for signup is:
                        </p>
                        <h1 style="font-size: 24px; color: #007BFF; text-align: center; margin: 20px 0;">
                            ${otp}
                        </h1>
                        <p style="font-size: 16px; color: #555555;">
                            This code is valid for 5 minutes. Please enter it in the provided field to complete your signup process.
                        </p>
                        <p style="font-size: 16px; color: #555555;">
                            If you did not request this code, please ignore this email or contact our support team.
                        </p>
                        <hr style="border: 1px solid #dddddd;">
                        <p style="font-size: 14px; color: #777777; text-align: center;">
                            Best Regards,<br>
                            <strong>The First Web Support Team</strong>
                        </p>
                        <p style="font-size: 12px; color: #aaaaaa; text-align: center;">
                            This is an automated message. Please do not reply to this email. For any inquiries, contact us at 
                            <a href="mailto:support@yourbusiness.com" style="color: #007BFF; text-decoration: none;">support@yourbusiness.com</a>.
                        </p>
                    </div>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Signup OTP sent' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Verify OTP
const verifyOtpEmail = async (req, res) => {
    const { email, otp } = req.body;

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const user = await User.findOne({ email });
        const otpRecord = await Otp.findOne({ email });

        if (!otpRecord) {
            return res.status(400).json({ success: false, message: 'No OTP found for this email' });
        }

        if (otpRecord.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        // Generate JWT token, including user ID if the user exists
        const tokenPayload = { email };
        if (user) {
            tokenPayload.userId = user._id; // Include the user ID if user exists
        }

        // Verify OTP and generate token if user exists
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Optionally remove the OTP record after verification
        await Otp.deleteOne({ email });

        if (user) {
            return res.status(200).json({ success: true, token, message: 'Login successful' });
        } else {
            return res.status(200).json({ success: true, message: 'User does not exist, proceed with signup' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Function to verify the token from headers
verifyToken = (req, res) => {
    // Get token from headers
    const token = req.headers['authorization']?.split(' ')[1]; // Assuming token is in the format "Bearer <token>"

    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided. User is not logged in.' });
    }

    try {
        // Verify and decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Return the user ID in the response
        return res.status(200).json({ success: true, userId: decoded.userId});
    } catch (error) {
        console.error('Invalid token:', error);
        return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
};

const authLogin = async (req, res) => {
    const { email, name, location } = req.body;

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        // Log the login attempt in the UserTryLogin model
        const userTryLogin = new UserTryLogin({ email, name, location });
        await userTryLogin.save();

        // Check if the user exists in the database
        const user = await User.findOne({ email });

        if (!user) {
            // User does not exist, return response
            return res.status(200).json({ success: false, message: 'User not present. Please sign up.' });
        }

        // User exists, generate a JWT token with their ID
        const tokenPayload = { email, userId: user._id };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Return the token
        return res.status(200).json({ success: true, token, message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



module.exports = {verifyToken,sendLoginEmailOtp,sendSignupEmailOtp,verifyOtpEmail,authLogin};



// const UserOTP = require('../models/userOTP');   // Assuming UserOTP model is already created
// const jwt = require('jsonwebtoken');
// const nodemailer = require('nodemailer');  // Assuming nodemailer is already configured
// const crypto = require('crypto');          // For generating OTP
// const jwtDecode = require('jwt-decode');

// // Environment variables: process.env.JWT_SECRET, process.env.EMAIL_SENDER, etc.
// const transporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com',  // Replace with your SMTP host
//     port: 587,                 // Port (587 is typically used for secure connections)
//     secure: false,             // true for 465, false for other ports
//     auth: {
//         user: process.env.EMAIL_SENDER, // Your SMTP username
//         pass: process.env.EMAIL_PASS,    // Your SMTP password
//     },
// });

// // Utility function to generate a 6-digit OTP
// const generateMagicCode = () => {
//     return crypto.randomInt(100000, 999999).toString();
// };

// // 1. loginOrSignup: Generate OTP and send email
// const loginOrSignup = async (req, res) => {
//     const { email } = req.body;

//     try {
//         const otp = generateMagicCode(); // Generate a 6-digit OTP

//         // Check if the user already exists in the UserOTP collection
//         let userOtpRecord = await UserOTP.findOne({ email });

//         if (userOtpRecord) {
//             // Update the OTP if the email exists
//             userOtpRecord.otp = otp;
//             await userOtpRecord.save();
//         } else {
//             // Create a new entry for the email and OTP if it doesn't exist
//             userOtpRecord = new UserOTP({
//                 email,
//                 otp,
//             });
//             await userOtpRecord.save();
//         }

//         // Send OTP email
//         const mailOptions = {
//             from: process.env.EMAIL_SENDER,
//             to: email,
//             subject: 'Your OTP for The First Web Login or Signup',
//             text: `Dear user, your OTP for login/signup is ${otp}. It will expire in 5 minutes.`,
//             html: `
//                 <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; border-radius: 8px;">
//                     <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
//                         <h2 style="color: #333333;">Welcome to The First Web!</h2>
//                         <p style="font-size: 16px; color: #555555;">
//                             Dear user,
//                         </p>
//                         <p style="font-size: 16px; color: #555555;">
//                             Your One-Time Password (OTP) for login/signup is:
//                         </p>
//                         <h1 style="font-size: 24px; color: #007BFF; text-align: center; margin: 20px 0;">
//                             ${otp}
//                         </h1>
//                         <p style="font-size: 16px; color: #555555;">
//                             This OTP is valid for 5 minutes. Please enter it in the provided field to complete your login or signup process.
//                         </p>
//                         <p style="font-size: 16px; color: #555555;">
//                             If you did not request this OTP, please ignore this email or contact our support team.
//                         </p>
//                         <hr style="border: 1px solid #dddddd;">
//                         <p style="font-size: 14px; color: #777777; text-align: center;">
//                             Best Regards,<br>
//                             <strong>The First Web Support Team</strong>
//                         </p>
//                         <p style="font-size: 12px; color: #aaaaaa; text-align: center;">
//                             This is an automated message. Please do not reply to this email. For any inquiries, contact us at 
//                             <a href="mailto:support@yourbusiness.com" style="color: #007BFF; text-decoration: none;">support@yourbusiness.com</a>.
//                         </p>
//                     </div>
//                 </div>
//             `,
//         };
        
//         await transporter.sendMail(mailOptions);

//         res.status(200).json({
//             success: true,
//             message: 'OTP sent successfully to your email',
//         });

//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Error sending OTP',
//             error: error.message,
//         });
//     }
// };

// // 2. verifyOtp: Verify OTP and return JWT token
// const verifyOtp = async (req, res) => {
//     const { email, otp } = req.body;

//     try {
//         // Find OTP record for the given email
//         const userOtpRecord = await UserOTP.findOne({ email });

//         if (!userOtpRecord) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Invalid or expired OTP',
//             });
//         }

//         // Compare the provided OTP with the one stored in the database
//         if (userOtpRecord.otp !== otp) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Incorrect OTP',
//             });
//         }

//         // OTP is valid, generate a JWT token
//         const token = jwt.sign({ email: email }, process.env.JWT_SECRET, {
//             expiresIn: '1h',  // Token expires in 1 hour
//         });

//         // Optionally delete the OTP record after verification
//         await UserOTP.updateOne({ email }, { $set: { otp: null } });

//         // Send response with token
//         res.status(200).json({
//             success: true,
//             message: 'OTP verified successfully',
//             token,  // JWT token
//         });

//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Error verifying OTP',
//             error: error.message,
//         });
//     }
// };

// // utils/auth.js
