
const fs = require("fs");
require("dotenv").config();
const mongoose = require("mongoose");
const Tour = require("../../models/tourModels");

const DB = process.env.DATABASE;

mongoose
    .connect(DB)
    .catch((err) => {
        console.log(err);
    });



const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/tours.json`, "utf-8")
);

const importData = async () => {
    try {
        await Tour.create(tours);
        console.log("Data successfully loaded!");
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log("Data successfully deleted!");
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

// run this script 
// dirname + script name (import or delete)
if (process.argv[2] === "--import") {
    importData();
} else if (process.argv[2] === "--delete") {
    deleteData();
}

