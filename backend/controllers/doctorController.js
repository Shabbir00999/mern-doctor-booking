const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Review = require('../models/Review');

// @desc    Get doctors with search/filter
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res) => {
  try {
    const { search, specialization, minFees, maxFees } = req.query;
    let query = { isApproved: true };

    if (specialization && specialization !== 'All') {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    if (minFees || maxFees) {
      query.fees = {};
      if (minFees) query.fees.$gte = Number(minFees);
      if (maxFees) query.fees.$lte = Number(maxFees);
    }

    let doctors = await Doctor.find(query).populate('user', 'name email phone');

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      doctors = doctors.filter(
        (doc) =>
          (doc.user && searchRegex.test(doc.user.name)) ||
          searchRegex.test(doc.specialization)
      );
    }

    res.json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user', 'name email phone');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const reviews = await Review.find({ doctor: doctor._id })
      .populate('patient', 'name')
      .sort('-createdAt');

    res.json({
      success: true,
      data: doctor,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/profile
// @access  Private (Doctor only)
const updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const fieldsToUpdate = [
      'specialization',
      'experience',
      'fees',
      'bio',
      'qualification',
      'availability',
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        doctor[field] = req.body[field];
      }
    });

    const user = await User.findById(req.user.id);
    if (user) {
      if (req.body.name) user.name = req.body.name;
      if (req.body.phone) user.phone = req.body.phone;
      await user.save();
    }

    await doctor.save();

    const updatedProfile = await Doctor.findById(doctor._id).populate('user', 'name email phone');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  updateDoctorProfile,
};
