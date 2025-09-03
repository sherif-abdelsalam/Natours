const morgan = require('morgan'); // http request logger 
const express = require('express'); // web framework
const rateLimit = require('express-rate-limit'); // rate limiting 
const helmet = require('helmet'); // security headers

const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const toursRouter = require('./routers/tourRouter');
const usersRouter = require('./routers/userRouter');
const reviewRouter = require('./routers/reviewRouter');
const AppErrors = require('./utils/appErrors');

const globalErrorHandler = require('./controllers/errorController');

const app = express();

// set security HTTP headers like 
app.use(helmet()); // helps you secure your Express apps by setting various HTTP headers

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}



app.use(express.json({ limit: '10kb' }));

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
app.use(hpp({
    whitelist: [
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
}));


app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    message: 'Too many requests from this IP, please try again in an hour!'
}));

app.use(express.static(`${__dirname}/public`)); // serving static files

app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/reviews', reviewRouter);
app.all('*', (req, res, next) => {
    next(new AppErrors(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;