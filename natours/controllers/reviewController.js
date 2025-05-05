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

const createNewReview = catchAsync(async (req, res, next) => {
    const newReview = Review.create(req.body);
    res.status(201).json({
        status: "success",
        data: {
            review: newReview
        }
    });

});

module.exports = {
    getAllReviews,
    createNewReview
}