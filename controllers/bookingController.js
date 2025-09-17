const factory = require('../controllers/handlerFactory');
const Tour = require('../models/tourModels');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment', // required now
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${
                tour.imageCover
              }`
            ]
          }
        },
        quantity: 1
      }
    ]
  });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session
  });
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);

const createBookingCheckout = catchAsync(async session => {
  console.log(session);
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.amount_total / 100;
  await Booking.create({ tour, user, price });
});

exports.webhookCheckout = async (req, res) => {
  let event = req.body;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (endpointSecret) {
    // Get the signature sent by Stripe
    const signature = req.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        endpointSecret
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      return res.sendStatus(400);
    }
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    createBookingCheckout(session);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({
    recieved: true
  });
};
