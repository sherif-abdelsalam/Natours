const express = require("express");

const router = express.Router();

const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");

router.route("/")
    .get(tourController.getAllTours)
    .post(tourController.createTour);

router.route("/top-5-cheap")
    .get(tourController.aliasTopTours, tourController.getAllTours);

router.route("/tour-stats")
    .get(tourController.getTourStats);

router.route("/monthly-plan/:year")
    .get(tourController.getMonthlyPlan);

router.route("/:id")
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(
        authController.protect,
        authController.restrictTo("admin", "lead-guide"),
        tourController.deleteTour);


module.exports = router;