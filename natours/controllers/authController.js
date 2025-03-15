const catchAsync = require("../utils/catchAsync");
const jwt = require('jsonwebtoken');
const { promisify } = require("util");

const User = require("../models/userModel");
const AppErrors = require("../utils/appErrors");

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

exports.signup = catchAsync(async (req, res, next) => {

    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword
    });
    const token = signToken(newUser._id);

    res.status(201).json({
        status: "success",
        token,
        user: {
            name: newUser.name,
            email: newUser.email,
        }
    })

});


exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppErrors('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppErrors('Incorrect email or password', 401));
    }

    const token = signToken(user._id);

    res.status(200).json({
        status: "success",
        token,
        user: {
            name: user.name,
            email: user.email,
        }
    })
});


exports.protect = catchAsync(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new AppErrors("You are not logged in, Please log in!", 401));
    }

    console.log(token);
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    // const currentUser = await User.findById(decoded.id);
    // if (!currentUser) {
    //     return next(new AppErrors("The user belonging to this token does no longer exist", 401));
    // }


    next();
});