const express = require('express');
const morgan = require('morgan');

const toursRouter = require('./routers/tourRouter');
const usersRouter = require('./routers/userRouter');

const app = express();

app.use(morgan('dev'));
app.use(express.json());

app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);


const port = 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}`);
})