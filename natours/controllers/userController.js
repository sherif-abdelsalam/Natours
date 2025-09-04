const User = require("../models/userModel");
const AppErrors = require("../utils/appErrors");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");


const filterObjBody = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
}



const updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.confirmPassword) {
        return next(new AppErrors("This route is not for password updates. Please use /updatePassword", 400));
    }
    
    const filteredBody = filterObjBody(req.body, 'name', 'email');
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });
    
    res.status(200).json({
        status: "success",
        data: {
            user: updatedUser
        }
    });
});

const deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });
    res.status(204).json({
        status: "success",
        data: null
    });
});



const createUser = (req, res) => {
    res.status(500).json({
        status: "error",
        message: "This route is not defined. Please use /signup instead"
    });
}

const getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}
const getUser = factory.getOne(User);

const getAllUsers = factory.getAll(User);

// Do not update passwords with this!
// because we are using findByIdAndUpdate which does not run pre save middleware
// so the password will not be hashed
// and also we are not allowing to update password here
// so we are using filterObjBody to only allow name and email to be updated
//// use updateMe to update password
const updateUser = factory.updateOne(User);

// Delete user is admin only
const deleteUser = factory.deleteOne(User);


module.exports = {
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    updateMe,
    deleteMe,
    getMe
}