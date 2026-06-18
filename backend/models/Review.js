const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please add a rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please add a comment'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reviews per doctor-patient combo
reviewSchema.index({ doctor: 1, patient: 1 }, { unique: true });

// Static method to calculate average rating
reviewSchema.statics.getAverageRating = async function (doctorId) {
  const obj = await this.aggregate([
    {
      $match: { doctor: doctorId },
    },
    {
      $group: {
        _id: '$doctor',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    if (obj.length > 0) {
      await mongoose.model('Doctor').findByIdAndUpdate(doctorId, {
        averageRating: Math.round(obj[0].averageRating * 10) / 10,
        totalReviews: obj[0].totalReviews,
      });
    } else {
      await mongoose.model('Doctor').findByIdAndUpdate(doctorId, {
        averageRating: 0,
        totalReviews: 0,
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Post-save hook to call getAverageRating
reviewSchema.post('save', async function () {
  await this.constructor.getAverageRating(this.doctor);
});

module.exports = mongoose.model('Review', reviewSchema);
