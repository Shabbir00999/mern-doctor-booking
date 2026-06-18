const Review = require('../models/Review');
const Doctor = require('../models/Doctor');

// @desc    Create a new review for a doctor
// @route   POST /api/doctors/:id/reviews
// @access  Private (Patient only)
const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const doctorId = req.params.id;

    // Check if doctor profile exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    // Check if user has already reviewed this doctor
    const alreadyReviewed = await Review.findOne({
      doctor: doctorId,
      patient: req.user.id,
    });

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this doctor' });
    }

    // Create review
    const review = await Review.create({
      patient: req.user.id,
      doctor: doctorId,
      rating: Number(rating),
      comment,
    });

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this doctor' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createReview,
};
