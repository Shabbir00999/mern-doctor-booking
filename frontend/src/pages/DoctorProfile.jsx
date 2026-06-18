import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { doctorAPI, appointmentAPI } from '../services/api';
import { Star, Award, MapPin, Calendar, Clock, MessageSquare, AlertCircle, ShieldCheck } from 'lucide-react';

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Booking States
  const [availableDays, setAvailableDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null); // { dateStr, dayName, dayNum, month }
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Review States
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Fetch Doctor Profile & Reviews
  const fetchProfile = async () => {
    try {
      const data = await doctorAPI.getDoctorById(id);
      if (data.success) {
        setDoctor(data.data);
        setReviews(data.reviews);
      } else {
        setErrorMsg(data.message || 'Error fetching doctor profile');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error. Failed to retrieve doctor details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  // Generate next 7 days for scheduler
  useEffect(() => {
    if (doctor) {
      const days = [];
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      for (let i = 1; i <= 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        days.push({
          dateStr: d.toISOString().split('T')[0],
          dayName: dayNames[d.getDay()],
          dayNum: d.getDate(),
          month: monthNames[d.getMonth()]
        });
      }
      setAvailableDays(days);
      setSelectedDay(days[0]);
    }
  }, [doctor]);

  // Handle Booking
  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!selectedTimeSlot) {
      alert('Please select a time slot');
      return;
    }

    setBookingLoading(true);
    setBookingSuccess(false);
    
    try {
      const data = await appointmentAPI.bookAppointment({
        doctorId: doctor._id,
        date: selectedDay.dateStr,
        timeSlot: selectedTimeSlot,
        notes,
      });

      if (data.success) {
        setBookingSuccess(true);
        setSelectedTimeSlot('');
        setNotes('');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        alert(data.message || 'Failed to book appointment');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Booking error';
      alert(message);
    } finally {
      setBookingLoading(false);
    }
  };

  // Handle Review Submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewLoading(true);

    try {
      const data = await doctorAPI.addReview(doctor._id, rating, comment);
      if (data.success) {
        setReviewSuccess(true);
        setComment('');
        fetchProfile();
      } else {
        setReviewError(data.message || 'Failed to add review');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Review error';
      setReviewError(message);
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading doctor profile...</div>;
  }

  if (errorMsg || !doctor) {
    return (
      <div className="container section" style={{ textAlign: 'center' }}>
        <AlertCircle size={48} style={{ color: 'var(--danger)', marginBottom: '16px' }} />
        <h2>Profile Error</h2>
        <p>{errorMsg || 'Doctor profile not found.'}</p>
        <Link to="/doctors" className="btn btn-primary" style={{ marginTop: '20px' }}>Back to Doctor Listings</Link>
      </div>
    );
  }

  // Find active time slots for the selected day of the week
  const doctorDayConfig = doctor.availability?.find(
    (item) => item.day.toLowerCase() === selectedDay?.dayName.toLowerCase()
  );
  const dayTimeSlots = doctorDayConfig ? doctorDayConfig.timeSlots : [];

  const docName = doctor.user?.name || 'Verified Specialist';
  const hasReviewed = reviews.some((r) => r.patient?._id === user?._id);

  return (
    <div className="container section">
      <div className="profile-grid">
        {/* Left Side: Profile Details */}
        <div>
          <div className="glass-card profile-card-large">
            <div className="profile-header-flex">
              <img
                src={doctor.image}
                alt={docName}
                className="profile-img-lg"
                onError={(e) => { e.target.src = '/uploads/default-doctor.png'; }}
              />
              <div className="profile-title-area">
                <span className="profile-badge-spec">{doctor.specialization}</span>
                <h2>{docName}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: 'var(--warning)', margin: '4px 0 10px 0' }}>
                  <Star size={16} fill="currentColor" />
                  <strong>{doctor.averageRating ? doctor.averageRating.toFixed(1) : '0.0'}</strong>
                  <span style={{ color: 'var(--text-secondary)' }}>({doctor.totalReviews || 0} reviews)</span>
                </div>
                <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <Award size={16} style={{ color: 'var(--secondary)' }} /> {doctor.qualification} ({doctor.experience} years exp)
                </p>
              </div>
            </div>

            <div className="profile-section-body">
              <h3>About Dr. {docName.split(' ').pop()}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', lineHeight: '1.7' }}>
                {doctor.bio || `Dr. ${docName} is a highly accomplished specialist dedicated to patient outcomes and collaborative medical care.`}
              </p>
            </div>

            <div className="profile-section-body">
              <h3>Clinic Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <div>
                  <p><strong>Practice Location:</strong></p>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <MapPin size={14} /> Main Clinic Office, Suite A
                  </p>
                </div>
                <div>
                  <p><strong>Consultation Fees:</strong></p>
                  <p style={{ fontSize: '18px', color: 'var(--text-bright)', fontWeight: 'bold', marginTop: '4px' }}>
                    ${doctor.fees} <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text-secondary)' }}>per slot</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Area */}
          <div className="glass-card" style={{ padding: '32px', marginTop: '32px' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={20} /> Patient Reviews
            </h3>

            {/* Write a Review (Visible to logged-in patients who haven't reviewed yet) */}
            {user && user.role === 'patient' && !hasReviewed && !reviewSuccess && (
              <form onSubmit={handleReviewSubmit} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '24px', marginBottom: '24px' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text-bright)' }}>Write a Consultation Review</h4>
                
                {reviewError && <div className="alert alert-danger">{reviewError}</div>}
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Your Rating:</span>
                  <select
                    className="input-field"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    style={{ padding: '6px 12px', fontSize: '13px', background: 'var(--bg-input)' }}
                  >
                    <option value="5">5 Stars (Excellent)</option>
                    <option value="4">4 Stars (Good)</option>
                    <option value="3">3 Stars (Average)</option>
                    <option value="2">2 Stars (Poor)</option>
                    <option value="1">1 Star (Very Bad)</option>
                  </select>
                </div>

                <div className="form-group">
                  <textarea
                    placeholder="Describe your appointment experience, clinic behavior, and consultation outcomes..."
                    className="input-field"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={{ minHeight: '70px', fontSize: '13px' }}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-sm" disabled={reviewLoading}>
                  {reviewLoading ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}

            {reviewSuccess && (
              <div className="alert alert-success" style={{ marginBottom: '24px' }}>
                Thank you! Your feedback has been posted successfully.
              </div>
            )}

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <div className="reviews-list">
                {reviews.map((rev) => (
                  <div key={rev._id} className="review-item">
                    <div className="review-meta">
                      <span className="review-author">{rev.patient ? rev.patient.name : 'Verified Patient'}</span>
                      <div className="review-rating" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Star size={12} fill="currentColor" />
                        <strong>{rev.rating} / 5</strong>
                      </div>
                    </div>
                    <p className="review-comment">{rev.comment}</p>
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'right' }}>
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center', padding: '24px 0' }}>
                No reviews yet for this doctor. Be the first to book and share your feedback!
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Appointment Scheduler Card */}
        <div>
          <div className="glass-card booking-card">
            <h3 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} style={{ color: 'var(--primary)' }} /> Book Appointment
            </h3>

            {bookingSuccess ? (
              <div className="alert alert-success" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={20} />
                  <strong>Booking Completed!</strong>
                </div>
                <p style={{ fontSize: '13px' }}>Your slot has been reserved. Redirecting to your appointment dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleBooking}>
                <div className="booking-fee-row">
                  <span>Consultation Fee:</span>
                  <h3>${doctor.fees}</h3>
                </div>

                {/* Date Grid */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    1. Select Date
                  </label>
                  <div className="date-select-grid">
                    {availableDays.map((day) => (
                      <div
                        key={day.dateStr}
                        className={`date-slot ${selectedDay?.dateStr === day.dateStr ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedDay(day);
                          setSelectedTimeSlot('');
                        }}
                      >
                        <p style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{day.dayName.substring(0, 3)}</p>
                        <h4 style={{ fontSize: '16px', margin: '2px 0' }}>{day.dayNum}</h4>
                        <p style={{ fontSize: '10px' }}>{day.month}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Time Slots Grid */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    2. Select Time Slot {selectedDay && `(${selectedDay.dayName})`}
                  </label>
                  {dayTimeSlots.length > 0 ? (
                    <div className="time-slot-grid">
                      {dayTimeSlots.map((slot) => (
                        <div
                          key={slot}
                          className={`time-slot-option ${selectedTimeSlot === slot ? 'selected' : ''}`}
                          onClick={() => setSelectedTimeSlot(slot)}
                        >
                          <Clock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                          {slot}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '6px', color: 'var(--danger)', fontSize: '12.5px', textAlign: 'center' }}>
                      Dr. {docName.split(' ').pop()} is not available on {selectedDay?.dayName}s.
                    </div>
                  )}
                </div>

                {/* Reason Notes */}
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label htmlFor="notes">3. Reason for Visit (Optional)</label>
                  <input
                    id="notes"
                    type="text"
                    className="input-field"
                    placeholder="Describe your health symptoms..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{ width: '100%', fontSize: '13px' }}
                  />
                </div>

                {/* Booking Button */}
                {user ? (
                  user.role === 'patient' ? (
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '12px' }}
                      disabled={bookingLoading || dayTimeSlots.length === 0}
                    >
                      {bookingLoading ? 'Processing Request...' : 'Confirm Appointment'}
                    </button>
                  ) : (
                    <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                      Only Patient accounts can schedule clinical bookings.
                    </div>
                  )
                ) : (
                  <Link to="/login" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                    Sign In to Schedule
                  </Link>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
