import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldAlert, UserPlus, Upload, ShieldCheck } from 'lucide-react';

const Register = () => {
  const [activeTab, setActiveTab] = useState('patient'); // 'patient' or 'doctor'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Doctor specific fields
  const [specialization, setSpecialization] = useState('Cardiology');
  const [experience, setExperience] = useState('');
  const [fees, setFees] = useState('');
  const [qualification, setQualification] = useState('');
  const [bio, setBio] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  const { register, registerDoctor, error, setError, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Clear errors
  useEffect(() => {
    setError(null);
    setFormError('');
  }, [activeTab]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'doctor') navigate('/doctor-dashboard');
      else navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setError(null);

    // Basic Validations
    if (!name || !email || !password || !phone) {
      setFormError('Please fill in all basic fields');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);

    if (activeTab === 'patient') {
      const userRole = await register(name, email, password, phone, 'patient');
      setSubmitting(false);
      if (userRole) {
        navigate('/dashboard');
      }
    } else {
      // Doctor registration
      if (!experience || !fees || !qualification) {
        setFormError('Please fill in all doctor specialization details');
        setSubmitting(false);
        return;
      }

      // Create FormData
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('phone', phone);
      formData.append('specialization', specialization);
      formData.append('experience', experience);
      formData.append('fees', fees);
      formData.append('qualification', qualification);
      formData.append('bio', bio);
      if (image) {
        formData.append('image', image);
      }

      const userRole = await registerDoctor(formData);
      setSubmitting(false);
      
      if (userRole) {
        setRegSuccess(true);
        // Clean form
        setName('');
        setEmail('');
        setPassword('');
        setPhone('');
        setImage(null);
        setImagePreview('');
      }
    }
  };

  const specializationsList = [
    'Cardiology',
    'Dermatology',
    'Pediatrics',
    'Neurology',
    'Orthopedics',
    'General Medicine',
    'Ophthalmology',
    'Psychiatry',
  ];

  return (
    <div className="auth-wrapper" style={{ padding: '60px 0' }}>
      <div className="glass-card auth-container" style={{ maxWidth: activeTab === 'doctor' ? '600px' : '480px' }}>
        <h2 className="form-title">Create Account</h2>
        <p className="form-subtitle">Register to begin booking consultations or listing your practice</p>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${activeTab === 'patient' ? 'active' : ''}`}
            onClick={() => setActiveTab('patient')}
          >
            Patient Portal
          </button>
          <button
            type="button"
            className={`auth-tab ${activeTab === 'doctor' ? 'active' : ''}`}
            onClick={() => setActiveTab('doctor')}
          >
            Doctor Portal
          </button>
        </div>

        {formError && (
          <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={16} />
            <span>{formError}</span>
          </div>
        )}

        {error && (
          <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        {regSuccess && (
          <div className="alert alert-success" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} />
              <strong>Registration Received!</strong>
            </div>
            <p style={{ fontSize: '13px' }}>Your doctor profile has been created successfully. Since doctor accounts require medical verification, you will need to wait for Admin Approval before appearing in clinical search results. You can now login to check your panel status.</p>
            <Link to="/login" className="btn btn-success btn-sm" style={{ alignSelf: 'flex-start', marginTop: '4px' }}>Go to Login</Link>
          </div>
        )}

        {!regSuccess && (
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  className="input-field"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  className="input-field"
                  placeholder="555-0199"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="john.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="input-field"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Doctor specific fields rendering dynamically */}
            {activeTab === 'doctor' && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '20px' }}>
                <h4 style={{ color: 'var(--text-bright)', marginBottom: '16px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Professional Details
                </h4>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="specialization">Specialization</label>
                    <select
                      id="specialization"
                      className="input-field"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      style={{ background: 'var(--bg-input)' }}
                    >
                      {specializationsList.map((spec) => (
                        <option key={spec} value={spec} style={{ background: '#0f172a' }}>
                          {spec}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="experience">Experience (Years)</label>
                    <input
                      id="experience"
                      type="number"
                      min="0"
                      className="input-field"
                      placeholder="e.g. 8"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fees">Consultation Fees ($)</label>
                    <input
                      id="fees"
                      type="number"
                      min="0"
                      className="input-field"
                      placeholder="e.g. 120"
                      value={fees}
                      onChange={(e) => setFees(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="qualification">Qualification</label>
                    <input
                      id="qualification"
                      type="text"
                      className="input-field"
                      placeholder="e.g. MD, MBBS"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="bio">Professional Bio</label>
                  <textarea
                    id="bio"
                    className="input-field"
                    placeholder="Provide a brief summary of your medical experience, qualifications, and patient care philosophies..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    style={{ minHeight: '80px', resize: 'vertical' }}
                  />
                </div>

                <div className="form-group">
                  <label>Profile Image</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px' }}>
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }}
                      />
                    )}
                    <label
                      htmlFor="doctor-image"
                      className="btn btn-secondary btn-sm"
                      style={{ cursor: 'pointer', display: 'inline-flex', gap: '6px' }}
                    >
                      <Upload size={14} /> Upload Picture
                    </label>
                    <input
                      id="doctor-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {image ? image.name : 'No file selected'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '16px' }} disabled={submitting}>
              {submitting ? 'Registering...' : 'Sign Up'} <UserPlus size={16} style={{ marginLeft: '6px' }} />
            </button>
          </form>
        )}

        <p className="auth-footer-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
