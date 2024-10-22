const nodemailer = require('nodemailer')
const twilio = require('twilio');

// Load Twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from Twilio
const authToken = process.env.TWILIO_AUTH_TOKEN;   // Your Auth Token from Twilio
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER; // Your Twilio WhatsApp number
const smsNumber = process.env.TWILIO_SMS_NUMBER; // Your Twilio WhatsApp number

const sendMessage = async (req, res) => {
    const { phone } = req.body; // Get the phone number and message from request body

    try {
        // Initialize the Twilio client
        const client = twilio(accountSid, authToken);

        // Sending SMS using Twilio API
        const result = await client.messages.create({
            from: smsNumber,      // Your Twilio phone number (e.g., +1234567890)
            to: phone,            // Recipient's phone number
            body: "Hello! 🎉 Welcome to The First Web! We're excited to have you on board. If you have any questions or need assistance, feel free to reach out. Enjoy exploring our services! 🌟 Best, The The First Web Team.",        // The message body (text) you want to send
        });

        // Respond with success message
        res.status(200).json({
            success: true,
            message: 'SMS sent successfully',
            data: result,          // Response from Twilio API
        });
    } catch (error) {
        // Handle errors and respond with failure message
        res.status(500).json({
            success: false,
            message: 'Error sending SMS',
            error: error.message,
        });
    }
};

// Function to send WhatsApp message
const sendWhatsappMessage = async (req, res) => {
    const { recipientNumber, message } = req.body;

    try {
        // Initialize the Twilio client
        const client = twilio(accountSid, authToken);

        // Sending WhatsApp message using Twilio API
        const result = await client.messages.create({
            from: `whatsapp:${whatsappNumber}`,  // Your Twilio WhatsApp number
            to: `whatsapp:${recipientNumber}`,   // Recipient's WhatsApp number
            body: message,                       // Message body
        });

        // Respond with success message
        res.status(200).json({
            success: true,
            message: 'WhatsApp message sent successfully',
            data: result,
        });
    } catch (error) {
        // Handle errors and respond with failure message
        res.status(500).json({
            success: false,
            message: 'Error sending WhatsApp message',
            error: error.message,
        });
    }
};

// Configure the transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',  // Replace with your SMTP host
    port: 587,                 // Port (587 is typically used for secure connections)
    secure: false,             // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_SENDER, // Your SMTP username
        pass: process.env.EMAIL_PASS,    // Your SMTP password
    },
});

// Send email function
const sendEmail = (req, res) => {
    const { email } = req.body;

    const mailOptions = {
        from: process.env.EMAIL_SENDER,   // Sender's email address (e.g., your business email)
        to: email,                        // Recipient's email address
        subject: 'Welcome to The First Web - Let’s Get Started!',  // Subject line with business context
        text: `Dear user,\n\nWe’re thrilled to have you on board with The First Web!\nHere’s what you can expect as part of our community...\n\nBest Regards,\nThe First Web`,  // Plain text body (fallback)
        html: `
            <div style="font-family: Arial, sans-serif; font-size: 16px;">
                <p>Hello <strong>user</strong>,</p>
                <p>Welcome to <strong>The First Web</strong>! We’re thrilled to have you on board and look forward to helping you achieve your goals with our services.</p>
                <p>Here are some next steps you can take:</p>
                <ul>
                    <li><a href="your-link.com">Learn more about our services</a></li>
                    <li>Explore our <a href="your-link.com">product offerings</a></li>
                </ul>
                <p>If you have any questions, feel free to reach out to us at <a href="mailto:support@thefirstweb.com">support@thefirstweb.com</a>!</p>
                <p>Best Regards,<br/><strong>The First Web</strong></p>
                <hr/>
                <p style="font-size: 12px; color: gray;">
                    This is an automated message. Please do not reply. If you need assistance, contact us at support@thefirstweb.com.
                </p>
            </div>
        `,  // HTML body for professional design
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send({ message: 'Error sending email', error });
        }
        res.send({ message: 'Email sent successfully!', info });
    });
};

module.exports = {
    sendMessage,
    sendWhatsappMessage,
    sendEmail
}
