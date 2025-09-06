const { default: mongoose } = require("mongoose");
const Tour = require('./tourModels');

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Review can not be empty']
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belong to a tour']
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a user']
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name'
    })
    // .populate({
    //     path: 'tour',
    //     select: 'name'
    // });
    next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {

    const stats = await this.aggregate([
        { 
            $match: { tour: tourId } },
        {
            $group: {   
                _id: '$tour', // group by tour field
                nRating: { $sum: 1 }, // this add 1 for each document, so if there are 5 documents, it will be 5
                avgRating: { $avg: '$rating' } // this calculate the average of the rating field
            }
        }
    ]);

    // this is to update the tour document with the new average rating and number of ratings
    await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: stats.length > 0 ? stats[0].nRating : 0,
        ratingsAverage: stats.length > 0 ? stats[0].avgRating : 4.5
    });
}

reviewSchema.post('save', function (next) {
    // what is this point to? it points to the current review
    this.constructor.calcAverageRatings(this.tour);
});

module.exports = mongoose.model('Review', reviewSchema);