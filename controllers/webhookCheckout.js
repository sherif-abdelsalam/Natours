const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');

const createBookingCheckout = catchAsync(async session => {
  console.log(session);
  await Booking.create({ tour, user, price });
});

exports.webhookCheckout = (req, res) => {
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
  switch (event.type) {
    case 'checkout.session.completed':
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);

      break;
    default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}.`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({
    recieved: true
  });
};
