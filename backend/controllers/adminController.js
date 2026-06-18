const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// @desc    Get stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getAdminStats = async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await Doctor.countDocuments({});
    const approvedDoctors = await Doctor.countDocuments({ isApproved: true });
    const pendingDoctors = await Doctor.countDocuments({ isApproved: false });
    const totalAppointments = await Appointment.countDocuments({});
    
    const appointments = await Appointment.find({ status: 'approved' }).populate('doctor', 'fees');
    const totalEarnings = appointments.reduce((acc, curr) => acc + (curr.doctor ? curr.doctor.fees : 0), 0);

    res.json({
      success: true,
      stats: {
        totalPatients,
        totalDoctors,
        approvedDoctors,
        pendingDoctors,
        totalAppointments,
        totalEarnings,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all patients
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'doctor' } }).sort('-createdAt');
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all doctors
// @route   GET /api/admin/doctors
// @access  Private (Admin only)
const getDoctorsAdmin = async (req, res) => {
  try {
    const doctors = await Doctor.find({})
      .populate('user', 'name email phone')
      .sort('-createdAt');
    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve/revoke doctor verification
// @route   PUT /api/admin/doctors/:id/approve
// @access  Private (Admin only)
const approveDoctor = async (req, res) => {
  try {
    const { isApproved } = req.body;

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    doctor.isApproved = isApproved;
    await doctor.save();

    res.json({
      success: true,
      message: `Doctor verified status updated to ${isApproved ? 'Approved' : 'Pending'}`,
      data: doctor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'doctor') {
      await Doctor.findOneAndDelete({ user: user._id });
    }

    // Delete associated appointments
    if (user.role === 'doctor') {
      const doc = await Doctor.findOne({ user: user._id });
      if (doc) {
        await Appointment.deleteMany({ doctor: doc._id });
      }
    } else {
      await Appointment.deleteMany({ patient: user._id });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User and associated files deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all appointments
// @route   GET /api/admin/appointments
// @access  Private (Admin only)
const getAppointmentsAdmin = async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate('patient', 'name email')
      .populate({
        path: 'doctor',
        populate: {
          path: 'user',
          select: 'name email',
        },
      })
      .sort('-createdAt');

    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAdminStats,
  getUsers,
  getDoctorsAdmin,
  approveDoctor,
  deleteUser,
  getAppointmentsAdmin,
};
