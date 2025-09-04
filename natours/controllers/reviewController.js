const Review = require("../models/reviewModel");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

const getAllReviews = catchAsync(async (req, res, next) => {
    // let reviews;
    // // Allow nested routes
    // if (req.params.tourId) {
    //     reviews = await Review.find({    : req.params.tourId }).select('-__v');
    // }else{
    //     reviews = await Review.find().select('-__v');
    // }
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const reviews = await Review.find(filter).select('-__v');
    res.status(200).json({
        status: "success",
        results: reviews.length,
        data: {
            reviews
        }
    })
});

const setTourUserIds = (req, res, next) => {
    // Allow nested routes
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
}
const createReview = factory.createOne(Review);

const deleteReview = factory.deleteOne(Review);
const updateReview = factory.updateOne(Review);

module.exports = {
    getAllReviews,
    createReview,
    updateReview,
    deleteReview,
    setTourUserIds
}