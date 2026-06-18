import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Award, Calendar } from 'lucide-react';

const DoctorCard = ({ doctor }) => {
  if (!doctor) return null;

  // Retrieve user name and properties
  const docName = doctor.user ? doctor.user.name : 'Doctor Profile';
  const imageUrl = doctor.image || '/uploads/default-doctor.png';

  return (
    <div className="glass-card doctor-card">
      <div className="doctor-image-wrapper">
        <img src={imageUrl} alt={docName} onError={(e) => { e.target.src = '/uploads/default-doctor.png'; }} />
        <span className="doctor-info-badge">{doctor.experience} Yrs Exp</span>
      </div>
      
      <div className="doctor-card-content">
        <span className="doctor-card-spec">{doctor.specialization}</span>
        <h3>{docName}</h3>
        
        <div className="doctor-card-rating">
          <Star size={16} fill="currentColor" />
          <strong>{doctor.averageRating ? doctor.averageRating.toFixed(1) : '0.0'}</strong>
          <span>({doctor.totalReviews || 0} reviews)</span>
        </div>

        <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Award size={14} style={{ color: '#0d9488' }} /> {doctor.qualification || 'Medical Degree'}
        </p>

        <div className="doctor-card-footer">
          <div className="doctor-card-fees">
            <h4>${doctor.fees}</h4>
            <p>per session</p>
          </div>
          
          <Link to={`/doctors/${doctor._id}`} className="btn btn-primary btn-sm">
            <Calendar size={14} /> Book Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
