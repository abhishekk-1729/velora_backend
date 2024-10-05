const express = require('express')
const router = express.Router()

const alertsRouter = require('./alerts')
const authRouter = require('./auth')

// const authenticate = require('../utils/auth/authenticate')
// const { appUserAuthMiddleware } = require('../utils/auth/appTokenVerify')

router.get('/', (req, res) => {
  res.send('<h1>Congrats, Backend is running well !!</h1>');
});
router.use('/api/v1/alert', alertsRouter); //tested
router.use('/api/v1/auth', authRouter); //tested
// router.use('/api/v1/dashboard', authenticate.studentAuthMiddleware, dashboardRouter);
// router.use('/api/v1/app', appUserAuthMiddleware, appRouter);

// router.use('/api/v1/admin',
//   authenticate.adminAuthMiddleware,
//   adminRouter);
// router.use('/api/v1/secy', authenticate.secyAuthMiddleware, secyRouter);

module.exports = router
