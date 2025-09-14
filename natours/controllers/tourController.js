const multer = require('multer');
const sharp = require('sharp');

const Tour = require('../models/tourModels');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// const APIFeatures = require("../utils/apiFeatures");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppErrors('Not an image! Please upload only images!!'), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

const uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

const resizeTourImages = async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // image cover it is like the user
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  req.body.images = [];
  // multiple image []

  await Promise.all(
    req.files.images.map(async (image, i) => {
      const imageName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(image.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${imageName}`);
      req.body.images.push(imageName);
    })
  );
  next();
};

const AppErrors = require('../utils/appErrors');

const aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

const getAllTours = factory.getAll(Tour, 'tours');

const getTour = factory.getOne(Tour, { path: 'reviews' });

const createTour = factory.createOne(Tour);

const updateTour = factory.updateOne(Tour);

const deleteTour = factory.deleteOne(Tour);

const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        // group by difficulty
        _id: '$difficulty', // group by difficulty
        numTours: { $sum: 1 }, // count number of tours in each difficulty
        numRatings: { $sum: '$ratingsQuantity' }, // sum of ratingsQuantity field
        avgRating: { $avg: '$ratingsAverage' }, // average of ratingsAverage field
        avgPrice: { $avg: '$price' }, // average of price field
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});
const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // *1 to convert to number
  const plan = await Tour.aggregate([
    // unwind is used to deconstruct an array field from the input documents to output a document for each element
    // here we deconstruct the startDates array field
    // so if a tour has 3 start dates, it will be 3 documents in the output
    // we can then match, group, sort, etc. on these documents
    {
      $unwind: '$startDates' // deconstructs an array field from the input documents to output a document for each element
    },
    // match only the documents that have startDates in the specified year
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    // group by month
    // _id is the field to group by
    // here we group by month of the startDates field
    {
      $group: {
        _id: { $month: '$startDates' }, // group by month
        numTourStarts: { $sum: 1 }, // count number of tour starts in each month
        tours: { $push: '$name' } // push tour names to an array
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    // remove _id field
    {
      $project: { _id: 0 }
    },
    // sort by number of tour starts in descending order
    {
      $sort: { numTourStarts: -1 }
    },
    // limit to 12 results
    {
      $limit: 12
    }
  ]);
  res.status(200).json({
    status: 'success',
    results: plan.length,
    data: {
      plan
    }
  });
});

const getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1; // radius of the earth in miles and km

  if (!lat || !lng) {
    next(
      new AppErrors(
        'Please provide latitude and longitude in the format lat,lng.',
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius]
      }
    }
  });
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
});

const getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001; // convert to miles or km

  if (!lat || !lng) {
    next(
      new AppErrors(
        'Please provide latitude and longitude in the format lat,lng.',
        400
      )
    );
  }

  // geospatial aggregation
  // must have at least one of the fields indexed with a 2dsphere index
  //
  const distances = await Tour.aggregate([
    {
      // must be the first stage in the pipeline
      // geonear requires at least one of the fields to be indexed with a 2dsphere index
      // if we have multiple geospatial fields, we can specify which one to use with the 'key' option
      // here we have only one geospatial field, so we don't need to specify the 'key' option
      // it calculates the distance from the specified point to each document in the collection
      // the distance is calculated in meters by default
      // near: point from which to calculate distance
      // distanceField: field in which to store the calculated distance
      // distanceMultiplier: factor by which to multiply the distance
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1] // *1 to convert to number
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier // convert to miles or km
      }
    },

    // This stage is optional, it is used to project only the fields we want
    // project: specify which fields to include or exclude in the output
    // here we include only distance and name fields
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      data: distances
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
  getMonthlyPlan,
  getToursWithin,
  getDistances,
  uploadTourImages,
  resizeTourImages
};
