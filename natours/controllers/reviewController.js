const Review = require("../models/reviewModel");
const catchAsync = require("../utils/catchAsync");

const getAllReviews = catchAsync(async (req, res, next) => {

    const reviews = await Review.find().select('-__v');
    res.status(200).json({
        status: "success",
        results: reviews.length,
        data: {
            reviews
        }
    })
});

const createReview = catchAsync(async (req, res, next) => {
    // Allow nested routes
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;

    const newReview = await Review.create(req.body);

    res.status(201).json({
        status: "success",
        data: {
            review: newReview
        }
    });

});

const deleteReview = catchAsync(async(req, res) => {
    await Review.findByIdAndDelete(req.params.id);
    res.status(204).json({
        status: 'success',
        data: null
    });
});

module.exports = {
    getAllReviews,
    createReview,
    deleteReview
}