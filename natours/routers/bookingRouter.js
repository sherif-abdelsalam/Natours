const { Router } = require('express');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = Router();

router.get(
  '/checkout-session/:tourId',
  authController.protect,
  bookingController.getCheckoutSession
);

module.exports = router;
