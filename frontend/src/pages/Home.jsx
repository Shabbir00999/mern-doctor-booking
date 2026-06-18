import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DoctorCard from '../components/DoctorCard';
import { doctorAPI } from '../services/api';
import { Search, HeartPulse, ShieldCheck, Stethoscope, UserPlus, CheckCircle2 } from 'lucide-react';

const Home = () => {
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await doctorAPI.getDoctors({ limit: 3 });
        if (data.success) {
          setFeaturedDoctors(data.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching featured doctors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/doctors?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/doctors');
    }
  };

  const specializations = [
    { name: 'Cardiology', icon: '❤️' },
    { name: 'Dermatology', icon: '☀️' },
    { name: 'Pediatrics', icon: '👶' },
    { name: 'Neurology', icon: '🧠' },
    { name: 'Orthopedics', icon: '🦴' },
    { name: 'General Medicine', icon: '🩺' },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-glow-1"></div>
        <div className="hero-glow-2"></div>
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="hero-tagline">
                <HeartPulse size={14} /> Healthcare Redefined
              </div>
              <h1 className="hero-title">
                Find and Book the <span>Best Doctors</span> Near You.
              </h1>
              <p className="hero-desc">
                Connect with verified medical specialists. View available slots, consult fees, read real patient reviews, and schedule appointments instantly.
              </p>
              
              <form onSubmit={handleSearchSubmit} className="search-bar glass-card" style={{ padding: '4px', display: 'flex', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '36px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Search doctor names, specializations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '16px 16px 16px 48px', color: '#fff', fontSize: '15px' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ borderRadius: '8px' }}>
                  Search
                </button>
              </form>

              <div className="hero-stats">
                <div className="stat-item">
                  <h3>12k+</h3>
                  <p>Happy Patients</p>
                </div>
                <div className="stat-item">
                  <h3>150+</h3>
                  <p>Expert Doctors</p>
                </div>
                <div className="stat-item">
                  <h3>4.9</h3>
                  <p>Average Rating</p>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="glass-card hero-image-card" style={{ background: 'linear-gradient(145deg, rgba(23, 29, 43, 0.4), rgba(15, 23, 42, 0.6))' }}>
                <img
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600"
                  alt="Doctor consulting patient"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600";
                  }}
                />
                <div className="glass-card floating-card">
                  <div className="stat-card-icon stat-card-green" style={{ width: '36px', height: '36px' }}>
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '13px', color: '#fff' }}>100% Certified</h4>
                    <p style={{ fontSize: '11px', color: '#94a3b8' }}>Verified Specialists</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specializations Category */}
      <section className="section" style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Search by Specialization</h2>
            <p className="section-subtitle">Select a specialization category to instantly filter matching medical practitioners.</p>
          </div>

          <div className="specialization-grid">
            {specializations.map((spec) => (
              <div
                key={spec.name}
                className="glass-card specialization-card"
                onClick={() => navigate(`/doctors?specialization=${spec.name}`)}
              >
                <div className="spec-icon" style={{ fontSize: '24px' }}>
                  {spec.icon}
                </div>
                <h3>{spec.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Featured Doctors</h2>
            <p className="section-subtitle">Book a session with some of our highest-rated verified medical specialists.</p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading featured doctors...</div>
          ) : featuredDoctors.length > 0 ? (
            <div className="doctors-grid">
              {featuredDoctors.map((doc) => (
                <DoctorCard key={doc._id} doctor={doc} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Stethoscope size={48} />
              <p>No featured doctors found. Register doctor profiles via the sign up portal.</p>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/doctors" className="btn btn-secondary">
              View All Doctors
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="section" style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How DocReserve Works</h2>
            <p className="section-subtitle">Schedule your medical consultations online in three straightforward steps.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
            <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
              <div className="stat-card-icon stat-card-blue" style={{ margin: '0 auto 20px', width: '60px', height: '60px', borderRadius: '50%' }}>
                <Search size={24} />
              </div>
              <h3 style={{ marginBottom: '12px' }}>1. Find a Specialist</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Search through verified profiles based on specialization, price, and reviews.</p>
            </div>

            <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
              <div className="stat-card-icon stat-card-orange" style={{ margin: '0 auto 20px', width: '60px', height: '60px', borderRadius: '50%' }}>
                <UserPlus size={24} />
              </div>
              <h3 style={{ marginBottom: '12px' }}>2. Register & Select Slot</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Sign up, check the doctor's weekly calendar slots, and choose a time that fits your day.</p>
            </div>

            <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
              <div className="stat-card-icon stat-card-green" style={{ margin: '0 auto 20px', width: '60px', height: '60px', borderRadius: '50%' }}>
                <CheckCircle2 size={24} />
              </div>
              <h3 style={{ marginBottom: '12px' }}>3. Confirmed Booking</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Receive direct verification from the doctor. Review your schedule via your dashboard.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
