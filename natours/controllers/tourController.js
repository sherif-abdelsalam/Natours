const Tour = require("../models/tourModels");
const APIFeatures = require("../utils/apiFeatures");

const aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}


const getAllTours = async (req, res) => {
    try {
        const features = new APIFeatures(Tour.find(), req.query);
        features.filter().sort().limitFields().paginate();
        const tours = await features.query;
        res.status(200).json({
            status: "success",
            results: tours.length,
            data: {
                tours
            }
        });
    } catch (err) {
        console.log(err);
        res.status(404).json({
            status: "fail",
            message: err
        });
    }
}

const getTour = async (req, res) => {
    const { id } = req.params;

    try {
        const tour = await Tour.findById(id);
        res.status(200).json({
            status: "success",
            data: {
                tour
            }
        });
    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: err
        });
    }
}

const createTour = async (req, res) => {
    console.log(req.body);
    try {
        const newTour = await Tour.create(req.body);
        res.status(201).json({
            status: "success",
            data: {
                tour: newTour
            }
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err
        });
    }
}

const updateTour = async (req, res) => {
    const { id } = req.params;
    try {
        const tour = await Tour.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({
            status: "success",
            data: {
                tour
            }
        });
    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: err
        });
    }
}

const deleteTour = async (req, res) => {
    const { id } = req.params;
    try {
        await Tour.findByIdAndDelete(id);
        res.status(204).json({
            status: "success",
            data: null
        });
    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: err
        });
    }
}


module.exports = {
    getAllTours,
    getTour,
    createTour,
    updateTour,
    deleteTour,
    aliasTopTours
}