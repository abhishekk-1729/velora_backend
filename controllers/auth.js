const UserOTP = require('../models/userOTP');   // Assuming UserOTP model is already created
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');  // Assuming nodemailer is already configured
const crypto = require('crypto');          // For generating OTP

// Environment variables: process.env.JWT_SECRET, process.env.EMAIL_SENDER, etc.
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',  // Replace with your SMTP host
    port: 587,                 // Port (587 is typically used for secure connections)
    secure: false,             // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_SENDER, // Your SMTP username
        pass: process.env.EMAIL_PASS,    // Your SMTP password
    },
});

// Utility function to generate a 6-digit OTP
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

// 1. loginOrSignup: Generate OTP and send email
const loginOrSignup = async (req, res) => {
    const { email } = req.body;

    try {
        const otp = generateOTP(); // Generate a 6-digit OTP

        // Check if the user already exists in the UserOTP collection
        let userOtpRecord = await UserOTP.findOne({ email });

        if (userOtpRecord) {
            // Update the OTP if the email exists
            userOtpRecord.otp = otp;
            await userOtpRecord.save();
        } else {
            // Create a new entry for the email and OTP if it doesn't exist
            userOtpRecord = new UserOTP({
                email,
                otp,
            });
            await userOtpRecord.save();
        }

        // Send OTP email
        const mailOptions = {
            from: process.env.EMAIL_SENDER,
            to: email,
            subject: 'Your OTP for Velora Login/Signup',
            text: `Dear user, your OTP for login/signup is ${otp}. It will expire in 5 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; border-radius: 8px;">
                    <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
                        <h2 style="color: #333333;">Welcome to Velora!</h2>
                        <p style="font-size: 16px; color: #555555;">
                            Dear user,
                        </p>
                        <p style="font-size: 16px; color: #555555;">
                            Your One-Time Password (OTP) for login/signup is:
                        </p>
                        <h1 style="font-size: 24px; color: #007BFF; text-align: center; margin: 20px 0;">
                            ${otp}
                        </h1>
                        <p style="font-size: 16px; color: #555555;">
                            This OTP is valid for 5 minutes. Please enter it in the provided field to complete your login or signup process.
                        </p>
                        <p style="font-size: 16px; color: #555555;">
                            If you did not request this OTP, please ignore this email or contact our support team.
                        </p>
                        <hr style="border: 1px solid #dddddd;">
                        <p style="font-size: 14px; color: #777777; text-align: center;">
                            Best Regards,<br>
                            <strong>Velora Support Team</strong>
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

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully to your email',
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error sending OTP',
            error: error.message,
        });
    }
};

// 2. verifyOtp: Verify OTP and return JWT token
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        // Find OTP record for the given email
        const userOtpRecord = await UserOTP.findOne({ email });

        if (!userOtpRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP',
            });
        }

        // Compare the provided OTP with the one stored in the database
        if (userOtpRecord.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Incorrect OTP',
            });
        }

        // OTP is valid, generate a JWT token
        const token = jwt.sign({ email: email }, process.env.JWT_SECRET, {
            expiresIn: '1h',  // Token expires in 1 hour
        });

        // Optionally delete the OTP record after verification
        await UserOTP.updateOne({ email }, { $set: { otp: null } });

        // Send response with token
        res.status(200).json({
            success: true,
            message: 'OTP verified successfully',
            token,  // JWT token
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error verifying OTP',
            error: error.message,
        });
    }
};

module.exports = {loginOrSignup, verifyOtp};
