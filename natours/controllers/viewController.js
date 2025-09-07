const Tour = require("../models/tourModels");
const catchAsync = require("../utils/catchAsync");

exports.getOverview = catchAsync(async(req, res) => {
    // 1) get tour data from collection
    // 2) build template
    // 3) render that template using tour data from 1)

    const tours = await Tour.find();

    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });
});

exports.getTour = catchAsync(async(req, res) => {
    const {slug} = req.params;
    // 1) get the data, for the requested tour (including reviews and guides)
    // 2) build template
    // 3) render template using data from 1)

    const tour = await Tour.findOne({slug}).populate({path: 'reviews', select: 'review rating user'});

    res.status(200).render('tour', {
        title: tour.name,
        tour
    });
});
