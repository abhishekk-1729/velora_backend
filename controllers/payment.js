const Razorpay = require("razorpay");
const fs = require("fs");
const path = require("path");
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils');

const razorpay = new Razorpay({
    key_id:'rzp_live_MlxWqnBX5fORCU',
    key_secret:'2EEHlsag3YuzCpcHHNVhyVr2',
})

const readData = () => {
    if(fs.existsSync('orders.json')){
        const data = fs.readFileSync('orders.json');
        return JSON.parse(data)
    }
    return [];
}

const writeData = (data) => {
    fs.writeFileSync('orders.json', JSON.stringify(data,null,2));
}

if(!fs.existsSync('orders.json')){
    writeData([]);
}

const create_order = async (req, res) => {
    try {
        const { amount, currency, receipt, notes } = req.body;
    
        const options = {
          amount: amount, // Convert amount to paise
          currency,
          receipt,
          notes,
        };
    
        const order = await razorpay.orders.create(options);
        
        // Read current orders, add new order, and write back to the file
        const orders = readData();
        orders.push({
          order_id: order.id,
          amount: order.amount,
          currency: order.currency,
          receipt: order.receipt,
          status: 'created',
        });
        writeData(orders);
    
        res.json(order); // Send order details to frontend, including order ID
      } catch (error) {
        console.error(error);
        res.status(500).send('Error creating order');
      }
};

const verify_payment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const secret = razorpay.key_secret;
    const body = razorpay_order_id + '|' + razorpay_payment_id;
  
    try {
      const isValidSignature = validateWebhookSignature(body, razorpay_signature, secret);
      if (isValidSignature) {
        // Update the order with payment details
        const orders = readData();
        const order = orders.find(o => o.order_id === razorpay_order_id);
        if (order) {
          order.status = 'paid';
          order.payment_id = razorpay_payment_id;
          writeData(orders);
        }
        res.status(200).json({ status: 'ok' });
        console.log("Payment verification successful");
      } else {
        res.status(400).json({ status: 'verification_failed' });
        console.log("Payment verification failed");
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', message: 'Error verifying payment' });
    }  
};


module.exports = {
    create_order,
    verify_payment
}

