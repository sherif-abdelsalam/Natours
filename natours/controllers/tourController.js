const fs = require('fs');
const uuid = require('uuid');

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours.json`));

const getAllTours = (req, res) => {
    res.status(200).json({
        status: "success",
        results: tours.length,
        data: {
            tours
        }
    })
}

const getTour = (req, res) => {
    const { id } = req.params;
    const tour = tours.find(el => el._id === id);



    if (!tour) {
        return res.status(404).json({
            status: "fail",
            message: "Invalid ID"
        })
    }

    res.status(200).json({
        status: "success",
        data: {
            tour
        }
    })
}

const createTour = (req, res) => {

    if (!req.body.name || !req.body.price) {
        return res.status(400).json({
            status: "fail",
            message: "Missing name or price"
        })
    }

    const newId = uuid.v4();
    const newTour = Object.assign({ id: newId }, req.body);

    tours.push(newTour);

    fs.writeFile(`${__dirname}/../dev-data/data/tours.json`, JSON.stringify(tours), err => {

        if (err) {
            return res.status(404).json({
                status: "fail",
                message: err
            })
        }
        res.status(201).json({
            status: "success",
            data: {
                tour: newTour
            }
        })
    })
}

const updateTour = (req, res) => {
    res.status(200).json({
        data: {
            tour: "<Updated tour here...>"
        }
    })
}

const deleteTour = (req, res) => {
    res.status(204).json({
        status: "success",
        data: null
    })
}


module.exports = {
    getAllTours,
    getTour,
    createTour,
    updateTour,
    deleteTour
}