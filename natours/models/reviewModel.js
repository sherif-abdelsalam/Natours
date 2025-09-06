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

// to prevent duplicate reviews from the same user on the same tour
// we create a compound index on tour and user fields
// and set unique to true
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

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

reviewSchema.post('save', function () {
    // what is this point to? it points to the current review
    this.constructor.calcAverageRatings(this.tour);
    // next();
});


// to do the same thing for update and delete, we need to use findByIdAndUpdate and findByIdAndDelete
// but we can't use post middleware because we need to get the document before it is updated or deleted
// but the query middleware does not have access to the document
// so we need to use pre middleware to get the document before it is updated or deleted
// and then we can use post middleware to calculate the average ratings

// we use this trick to get access to the current document
// then pass it to the post middleware after the update or delete operation is done
reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.r = await this.model.findOne(this.getQuery());
    next();
});
reviewSchema.post(/^findOneAnd/, async function () {
    // await this.findOne(); does NOT work here, query has already executed
    await this.r.constructor.calcAverageRatings(this.r.tour);
});

// 2nd approach (using only post middleware, 
// reviewSchema.post(/^findOneAnd/, async function (doc) {
    // if (!doc) return;
    // await doc.constructor.calcAverageRatings(doc.tour);
// });

module.exports = mongoose.model('Review', reviewSchema);