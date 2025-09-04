const AppErrors = require("../utils/appErrors");
const catchAsync = require("../utils/catchAsync");

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

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const tour = await Model.findByIdAndUpdate(req.params.id, req.body, {
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


exports.createOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
        status: "success",
        data: {
            data: doc
        }
    });
});

