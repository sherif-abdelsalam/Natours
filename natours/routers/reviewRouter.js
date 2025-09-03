const express = require("express");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

const router = express.Router();

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(
        authController.protect,
        authController.restrictTo('user'),
        reviewController.createReview
    );
router
    .route('/:id')
    .delete(authController.protect,
        authController.restrictTo('user'),
        reviewController.deleteReview
    );


module.exports = router;