const express = require('express')
const router = express.Router()

const alertsRouter = require('./alerts')
const authRouter = require('./auth')
const paymentRouter = require('./payment')
const userRouter = require('./user')
const serviceRouter = require('./service')
const contactRouter = require('./contact')
const couponRouter = require('./coupon')
const uploadImage = require('./upload-image')

const orderRouter = require('./order')
const statusRouter = require('./status')
const cashbackRouter = require('./cashback')

// const authenticate = require('../utils/auth/authenticate')
// const { appUserAuthMiddleware } = require('../utils/auth/appTokenVerify')

router.get('/', (req, res) => {
  res.send('<h1>Congrats, Backend is running well !!</h1>');
});
router.use('/api/v1/alert', alertsRouter); //tested
router.use('/api/v1/auth', authRouter); //tested
router.use('/api/v1/payment', paymentRouter); //tested
router.use('/api/v1/user', userRouter); //tested
router.use('/api/v1/service', serviceRouter); //tested
router.use('/api/v1/contact', contactRouter); //tested
router.use('/api/v1/coupon', couponRouter); //tested
router.use('/api/v1/cashback', cashbackRouter); //tested
router.use('/api/v1/status', statusRouter); //tested
router.use('/api/v1/order', orderRouter); //tested
router.use('/api/v1/upload', uploadImage); //tested
// router.use('/api/v1/dashboard', authenticate.studentAuthMiddleware, dashboardRouter);
// router.use('/api/v1/app', appUserAuthMiddleware, appRouter);

// router.use('/api/v1/admin',
//   authenticate.adminAuthMiddleware,
//   adminRouter);
// router.use('/api/v1/secy', authenticate.secyAuthMiddleware, secyRouter);

module.exports = router
