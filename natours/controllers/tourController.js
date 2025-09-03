const Tour = require("../models/tourModels");
const APIFeatures = require("../utils/apiFeatures");
const AppErrors = require("../utils/appErrors");

const catchAsync = require('../utils/catchAsync');

const aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}

const getAllTours = catchAsync(async (req, res) => {
    const features = new APIFeatures(Tour.find(), req.query);
    features
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const tours = await features.query;

    console.log(tours.length);

    res.status(200).json({
        status: "success",
        results: tours.length,
        data: {
            tours
        }
    });
});

const getTour = catchAsync(async (req, res, next) => {


    // const tour = await Tour.findById(req.params.id).populate({
    //     path: 'reviews',
    //     select: '-createdAt -tour -__v'
    // });
    const tour = await Tour.findById(req.params.id).populate('reviews');
    if (!tour) {
        return next(new AppErrors('No tour found with that ID', 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            tour
        }
    });
});

const createTour = catchAsync(async (req, res, next) => {
    console.log(req.body);
    const newTour = await Tour.create(req.body);
    res.status(201).json({
        status: "success",
        data: {
            tour: newTour
        }
    });
});

const updateTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // return updated doc
        runValidators: true // run validators again on update 
    });
    if (!tour) {
        return next(new AppErrors('No tour found with that ID', 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            tour
        }
    });

});

const deleteTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) {
        return next(new AppErrors('No tour found with that ID', 404));
    }
    res.status(204).json({
        status: "success",
        data: null
    });
});

const getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {  // group by difficulty
                _id: "$difficulty", // group by difficulty
                numTours: { $sum: 1 }, // count number of tours in each difficulty
                numRatings: { $sum: "$ratingsQuantity" }, // sum of ratingsQuantity field
                avgRating: { $avg: "$ratingsAverage" }, // average of ratingsAverage field
                avgPrice: { $avg: "$price" }, // average of price field
                minPrice: { $min: "$price" },
                maxPrice: { $max: "$price" }
            }
        },
    ]);
    res.status(200).json({
        status: "success",
        data: {
            stats
        }
    })
});
const getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1; // *1 to convert to number
    const plan = await Tour.aggregate([
        {
            $unwind: "$startDates" // deconstructs an array field from the input documents to output a document for each element
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: { 
                _id: { $month: "$startDates" }, // group by month
                numTourStarts: { $sum: 1 }, // count number of tours starting in that month
                tours: { $push: "$name" } // push tour names to an array
            }
        },
        {
            $addFields: { month: "$_id" }
        },
        {
            $project: { _id: 0 }
        },
        {
            $sort: { numTourStarts: -1 }
        },
        {
            $limit: 12
        }

    ]);
    res.status(200).json({
        status: "success",
        results: plan.length,
        data: {
            plan
        }
    });
});

module.exports = {
    getAllTours,
    getTour,
    createTour,
    updateTour,
    deleteTour,
    aliasTopTours,
    getTourStats,
    getMonthlyPlan
}