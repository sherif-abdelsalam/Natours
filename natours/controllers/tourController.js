// const fs = require('fs');
// const uuid = require('uuid');

const Tour = require("../models/tourModels");

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours.json`));


// const checkId = (req, res, next, val) => {
//     console.log(val);
//     console.log('-------------------------');
//     const { id } = req.params;
//     const tour = tours.find(el => el._id === id);
//     if (!tour) {
//         return res.status(404).json({
//             status: "fail",
//             message: "Invalid ID"
//         })
//     }
//     next();
// }

// const checkBody = (req, res, next) => {
//     if (!req.body.name || !req.body.price) {
//         return res.status(400).json({
//             status: "fail",
//             message: "Missing name or price"
//         })
//     }
//     next();
// }
const getAllTours = async (req, res) => {
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    const queryObj = { ...req.query };
    excludeFields.forEach(el => delete queryObj[el]);

    try {
        const query = Tour.find(queryObj);
        console.log("------------------------------------------------")
        console.log(query);

        const tours = await query;
        res.status(200).json({
            status: "success",
            results: tours.length,
            data: {
                tours
            }
        });
    } catch (err) {
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
}