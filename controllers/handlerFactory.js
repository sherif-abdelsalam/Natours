const APIFeatures = require('../utils/apiFeatures');
const AppErrors = require('../utils/appErrors');
const catchAsync = require('../utils/catchAsync');
const { client } = require('../utils/redisClient.js');

// higher order functions
// This file contains factory functions for CRUD operations
// that can be reused for different models
// factory functions take a Model as an argument and return a middleware function
// that performs the desired operation on that Model
exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppErrors('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // return updated doc
      runValidators: true // run validators again on update
    });
    if (!doc) {
      return next(new AppErrors('No document found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        doc
      }
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    if (!doc) {
      return next(new AppErrors('No document found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

// exports.getAll = Model =>
//   catchAsync(async (req, res, next) => {
//     // To allow for nested GET reviews on tour (hack)
//     let filter = {};
//     if (req.params.tourId) filter = { tour: req.params.tourId };

//     // EXECUTE QUERY
//     const features = new APIFeatures(Model.find(filter), req.query);
//     features
//       .filter()
//       .sort()
//       .limitFields()
//       .paginate();

//     // to get query execution details and statistics
//     // const doc = await features.query.explain();
//     const doc = await features.query;

//     // SEND RESPONSE
//     res.status(200).json({
//       status: 'success',
//       results: doc.length,
//       data: {
//         data: doc
//       }
//     });
//   });

exports.getAll = (Model, cacheKeyPrefix = '') =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    // Generate a cache key (based on query + filter)
    const cacheKey = `${cacheKeyPrefix}:${JSON.stringify({
      filter,
      query: req.query
    })}`;

    // 1️⃣ Check cache
    const cached = await client.get(cacheKey);
    if (cached) {
      const doc = JSON.parse(cached);
      return res.status(200).json({
        status: 'success',
        results: doc.length,
        data: { data: doc }
      });
    }

    // 2️⃣ Query DB (MongoDB)
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.query;

    // 3️⃣ Store in Redis (cache for 1 min, can change TTL)
    await client.set(cacheKey, JSON.stringify(doc), { EX: 60 });

    // 4️⃣ Send response
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: { data: doc }
    });
  });
