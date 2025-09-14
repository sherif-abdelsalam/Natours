const express = require("express");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");


// why mergeParams: true?
// to get access to req.params.tourId in reviewController.createReview
// because reviewRouter is used in tourRouter with a nested route
// /:tourId/reviews
// so we need to merge the params from the parent router (tourRouter) to the child router (reviewRouter)
// otherwise, req.params will be an empty object in reviewRouter
const router = express.Router({ mergeParams: true });
router.use(authController.protect);

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(
        authController.restrictTo('user'),
        reviewController.setTourUserIds,
        reviewController.createReview
    );
router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(authController.restrictTo('user', 'admin'), reviewController.updateReview)
  .delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview);

module.exports = router;