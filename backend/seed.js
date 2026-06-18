const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');
const Review = require('./models/Review');

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/doctor-booking');
    console.log('MongoDB Connected for Seeding...');

    // Clear existing data
    await User.deleteMany();
    await Doctor.deleteMany();
    await Appointment.deleteMany();
    await Review.deleteMany();
    console.log('Existing data cleared.');

    // 1. Create Admin
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@example.com',
      password: 'admin123', // Will be hashed by userSchema pre-save hook
      role: 'admin',
      phone: '123-456-7890',
    });
    console.log('Admin user seeded: admin@example.com / admin123');

    // 2. Create Patient
    const patient = await User.create({
      name: 'John Doe',
      email: 'patient@example.com',
      password: 'patient123',
      role: 'patient',
      phone: '987-654-3210',
    });
    console.log('Patient user seeded: patient@example.com / patient123');

    // 3. Create Doctor Users and Profiles
    // Doctor 1 (Approved Cardiologist)
    const docUser1 = await User.create({
      name: 'Dr. Sarah Jenkins',
      email: 'doctor1@example.com',
      password: 'doctor123',
      role: 'doctor',
      phone: '555-0101',
    });
    const doc1 = await Doctor.create({
      user: docUser1._id,
      specialization: 'Cardiology',
      experience: 12,
      fees: 150,
      qualification: 'MD, FACC - Harvard Medical School',
      bio: 'Dr. Sarah Jenkins is a board-certified cardiologist with over 12 years of experience specializing in cardiovascular health, preventive cardiology, and echocardiography.',
      isApproved: true,
      availability: [
        { day: 'Monday', timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] },
        { day: 'Wednesday', timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] },
        { day: 'Friday', timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM'] },
      ],
    });

    // Doctor 2 (Approved Dermatologist)
    const docUser2 = await User.create({
      name: 'Dr. Michael Chen',
      email: 'doctor2@example.com',
      password: 'doctor123',
      role: 'doctor',
      phone: '555-0102',
    });
    const doc2 = await Doctor.create({
      user: docUser2._id,
      specialization: 'Dermatology',
      experience: 8,
      fees: 120,
      qualification: 'MD - Stanford University School of Medicine',
      bio: 'Dr. Michael Chen is a leading dermatologist specializing in both medical and cosmetic dermatology, including acne treatments, skin cancer screenings, and anti-aging therapies.',
      isApproved: true,
      availability: [
        { day: 'Tuesday', timeSlots: ['10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] },
        { day: 'Thursday', timeSlots: ['10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] },
      ],
    });

    // Doctor 3 (Pending Pediatrician)
    const docUser3 = await User.create({
      name: 'Dr. Emily Watson',
      email: 'doctor3@example.com',
      password: 'doctor123',
      role: 'doctor',
      phone: '555-0103',
    });
    const doc3 = await Doctor.create({
      user: docUser3._id,
      specialization: 'Pediatrics',
      experience: 5,
      fees: 90,
      qualification: 'DO - Johns Hopkins University',
      bio: 'Dr. Emily Watson is passionate about providing comprehensive pediatric care to children of all ages. She focuses on development, nutrition, and childhood immunization.',
      isApproved: false, // Requires admin approval
      availability: [
        { day: 'Monday', timeSlots: ['09:00 AM', '10:00 AM', '02:00 PM'] },
        { day: 'Friday', timeSlots: ['09:00 AM', '10:00 AM', '02:00 PM'] },
      ],
    });
    console.log('3 Doctors seeded (2 Approved, 1 Pending admin verification)');

    // 4. Create Reviews for Approved Doctors
    await Review.create({
      patient: patient._id,
      doctor: doc1._id,
      rating: 5,
      comment: 'Dr. Jenkins is incredibly thorough and explained my symptoms very clearly. Highly recommend!',
    });

    await Review.create({
      patient: patient._id,
      doctor: doc2._id,
      rating: 4,
      comment: 'Very professional clinic and great consultation. Solved my skin rash issue quickly.',
    });
    console.log('Sample reviews seeded and ratings recalculated.');

    // 5. Create a sample Appointment
    await Appointment.create({
      patient: patient._id,
      doctor: doc1._id,
      date: '2026-06-20',
      timeSlot: '10:00 AM',
      status: 'pending',
      notes: 'Standard cardiovascular checkup.',
    });
    console.log('Sample pending appointment seeded.');

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
