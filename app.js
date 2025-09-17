const morgan = require('morgan'); // http request logger
const express = require('express'); // web framework
const rateLimit = require('express-rate-limit'); // rate limiting
const helmet = require('helmet'); // security headers
const { join } = require('path');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const toursRouter = require('./routers/tourRouter');
const usersRouter = require('./routers/userRouter');
const reviewRouter = require('./routers/reviewRouter');
const viewRouter = require('./routers/viewRouter');
const bookingRouter = require('./routers/bookingRouter');
const bookingController = require('./controllers/bookingController');
const AppErrors = require('./utils/appErrors');

const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.enable('trust proxy', 1);

// set security HTTP headers like
app.use(helmet()); // helps you secure your Express apps by setting various HTTP headers

// ### 🌍 CORS Requests Summary

// **Simple Requests** (no preflight):
// * Methods: `GET`, `POST`, `HEAD`
// * Headers: only `Accept`, `Accept-Language`, `Content-Language`, `Content-Type` (must be `text/plain`, `multipart/form-data`, or `application/x-www-form-urlencoded`)
// * No custom headers
// * No cookies/auth unless explicitly allowed

// **Non-Simple Requests** (require preflight `OPTIONS`):
// * Methods: `PUT`, `PATCH`, `DELETE`, etc.
// * Custom headers (e.g. `Authorization`, `X-Custom-*`)
// * `Content-Type: application/json`
// * Cross-origin cookies

// **Rule of thumb**:

// * ✅ Simple → sent directly
// * ⚠️ Non-simple → browser sends preflight to ask permission

// set the header -> Access-Control-Allow-Origin *
app.use(cors()); // wo

// app.options('*', cors()); for prefilieght requestes  but the above works fine for it

// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'));
// }

app.get(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);
// steps to set up pug
// - set the view engine to pug
// - set the views directory
// - create a pug file in the views directory
// - render the pug file in a route

app.set('view engine', 'pug');
app.set('views', join(__dirname, 'views')); // default is /views
app.use(express.static(join(__dirname, 'public')));

// Body parser (reading data from body in req.body)
app.use(express.json({ limit: '10kb' }));
// this middleware used to parse data incoming from forms (actions)
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// app.use((req,res, next) => {
//     console.log(req.cookies);
//     next();
// });

// data sanitization against NoSQL query injection
// removes $ and . from req.body, req.queryString and req.params
// example: { "email": { "$gt": "" } } or { "email": { "$ne": "" } }
// will be changed to { "email": { "gt": "" } } or { "email": { "ne": "" } }
app.use(mongoSanitize());

// data sanitization against XSS
// cleans any user input from malicious HTML code
// example: <script>...</script>
// will be changed to &lt;script&gt;...&lt;/script&gt;
app.use(xss());

// prevent parameter pollution
// example: ?duration=5&duration=9
// will be changed to ?duration=9
// but if you want to allow duplicates for some parameters, you can add them to the whitelist
//
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    message: 'Too many requests from this IP, please try again in an hour!'
  })
);

app.use(compression());
// routes
app.use('/', viewRouter);
app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.all('*', (req, res, next) => {
  next(new AppErrors(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
