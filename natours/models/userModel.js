const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'User must have a name'],
    },
    email: {
        type: String,
        required: [true, 'User must have an email'],
        unique: [true, 'Email already exists'],
        validate: [validator.isEmail, 'Enter a valid email'],
    },
    photo: String,
    password: {
        type: String,
        minlength: [8, 'Password must be at least 8 characters long'],
        required: [true, 'Please provide a password'],
        select: false,
    },
    confirmPassword: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function (val) {
                return val === this.password;
            },
            message: 'Passwords do not match!',
        },
    },
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    next();
});

userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);
User.syncIndexes(); // Ensure indexes are in sync

module.exports = User;
