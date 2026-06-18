const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getUsers,
  getDoctorsAdmin,
  approveDoctor,
  deleteUser,
  getAppointmentsAdmin,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Secure all admin routes to logged-in admins only
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.get('/doctors', getDoctorsAdmin);
router.get('/appointments', getAppointmentsAdmin);
router.put('/doctors/:id/approve', approveDoctor);
router.delete('/users/:id', deleteUser);

module.exports = router;
