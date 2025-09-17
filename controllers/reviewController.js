const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

// const catchAsync = require("../utils/catchAsync");

const setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
const getAllReviews = factory.getAll(Review);
const createReview = factory.createOne(Review);
const deleteReview = factory.deleteOne(Review);
const updateReview = factory.updateOne(Review);
const getReview = factory.getOne(Review);

module.exports = {
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
  setTourUserIds,
  getReview
};
