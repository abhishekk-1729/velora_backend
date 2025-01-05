const jwt = require("jsonwebtoken");
const Order = require("../models/order");
const Status = require("../models/status");
const CouponCode = require("../models/coupon");
const nodemailer = require('nodemailer')



// 1. Create an order
const createOrder = async (req, res) => {
  const {
    user_id,
    service_id,
    discount,
    totalAmountOrder,
    currencyChange,
    couponCode,
    email
  } = req.body;
  console.log(currencyChange);
  console.log(couponCode);

  // find a coupon code id
  let couponCodeId = null;
  console.log(couponCode)
  if (couponCode) {
    const coupon = await CouponCode.findOne({ coupon_code: couponCode });
    console.log(coupon);
    couponCodeId = coupon._id;
    console.log(couponCodeId);
  }

  try {
    // Step 1: Create a new order
    const order = new Order({
      date: new Date(),
      user_id,
      service_id,
      discount,
      totalAmountOrder,
      currencyChange,
      couponCodeId,
    });
    await order.save();

    // Step 2: Create a new status record with null dates for all steps
    const status = new Status({
      order_id: order._id,
      completed_steps: 0,
      dates: {
        advance_payment: new Date(),
        ui_discussion: null,
        ui_started: null,
        ui_completed: null,
        client_review: null,
        dev_started: null,
        dev_completed: null,
        initial_quality: null,
        deployment_started: null,
        deployment_completed: null,
        precision_review: null,
        final_review: null,
        launch_readiness: null,
        remaining_payment: null,
        website_delivery: null,
      },
    });

    await status.save();

    console.log(email);
    const mailOptions = {
        from: 'support@thefirstweb.com', // Sender address
        to: email, // Recipient address
        subject: 'Order Confirmation - The First Web',
        html: `
            <h1>Thank You for Your Order!</h1>
            <p>Dear valued customer,</p>
            <p>We are excited to inform you that your order has been successfully created.</p>
            <p><strong>Order Details:</strong></p>
            <ul>
                <li>Order ID: ${order._id}</li>
                <li>Service ID: ${service_id}</li>
                <li>Discount: ${discount}</li>
                <li>Total Amount: ${totalAmountOrder} ${currencyChange}</li>
                <li>Coupon Code: ${couponCode ? couponCode : 'None'}</li>
            </ul>
            <p>At <strong>The First Web</strong>, we specialize in creating stunning websites for businesses like yours.</p>
            <p>If you have any questions, feel free to reach out!</p>
            <p>Best regards,<br>The First Web Team</p>
        `,
    };
    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',  // Replace with your SMTP host
      port: 587,                 // Port (587 is typically used for secure connections)
      secure: false,             // true for 465, false for other ports
      auth: {
          user: process.env.EMAIL_SENDER, // Your SMTP username
          pass: process.env.EMAIL_PASS,    // Your SMTP password
      },
  });
  
    console.log(mailOptions);
    await transporter.sendMail(mailOptions);    
    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
      status, // Optionally return the status if needed
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user_id")
      .populate("service_id");
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Get order by ID
const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findById(id)
      .populate("user_id")
      .populate("service_id");
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Delete an order
const deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    await Order.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllOrdersByUserId = async (req, res) => {
  // Get token from request headers
  const token = req.headers.authorization?.split(" ")[1]; // Assuming the token is sent in the Authorization header as "Bearer token"

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  try {
    // Decode the token to get the user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Fetch all orders for the user
    const orders = await Order.find({ user_id: userId }).populate("service_id");

    // Map the orders to return the desired format

    const formatDate = (date) => {
      if (!date) return "";

      const options = {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "UTC", // Set the time zone to UTC
      };
      return new Intl.DateTimeFormat("en-US", options).format(date);
    };

    const result = orders.map((order) => {
      const originalPrice = order.service_id.originalPrice;
      const discountAmount = (originalPrice * order.discount) / 100; // Calculate discount amount
      const totalAmount = originalPrice - discountAmount; // Calcul
      return {
        order_id: order._id,
        total_amount: order.totalAmountOrder,
        date: formatDate(order.date),
      };
    });

    res.status(200).json({
      success: true,
      orders: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  deleteOrder,
  getAllOrdersByUserId,
};
