const morgan = require('morgan');
const express = require('express');

const toursRouter = require('./routers/tourRouter');
const usersRouter = require('./routers/userRouter');
const AppErrors = require('./utils/appErrors');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(express.json());

app.use(express.static(`${__dirname}/public`));

app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);

app.all('*', (req, res, next) => {
    next(new AppErrors(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;