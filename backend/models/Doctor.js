const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true,
  },
  timeSlots: {
    type: [String],
    required: true,
  },
});

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    specialization: {
      type: String,
      required: [true, 'Please specify specialization'],
      trim: true,
    },
    experience: {
      type: Number,
      required: [true, 'Please specify years of experience'],
      min: 0,
    },
    fees: {
      type: Number,
      required: [true, 'Please specify consultation fees'],
      min: 0,
    },
    bio: {
      type: String,
      trim: true,
    },
    qualification: {
      type: String,
      required: [true, 'Please specify qualifications'],
      trim: true,
    },
    image: {
      type: String,
      default: '/uploads/default-doctor.png',
    },
    availability: {
      type: [availabilitySchema],
      default: [
        { day: 'Monday', timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] },
        { day: 'Wednesday', timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] },
        { day: 'Friday', timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] }
      ],
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Doctor', doctorSchema);
