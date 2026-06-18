import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DoctorCard from '../components/DoctorCard';
import { doctorAPI } from '../services/api';
import { Search, Filter, Stethoscope } from 'lucide-react';

const DoctorList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [specialization, setSpecialization] = useState(searchParams.get('specialization') || 'All');
  const [minFees, setMinFees] = useState('');
  const [maxFees, setMaxFees] = useState('');

  // Sync state with URL params on load
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setSpecialization(searchParams.get('specialization') || 'All');
  }, [searchParams]);

  // Fetch filtered doctors from API
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (search) filters.search = search;
      if (specialization && specialization !== 'All') filters.specialization = specialization;
      if (minFees) filters.minFees = minFees;
      if (maxFees) filters.maxFees = maxFees;

      const data = await doctorAPI.getDoctors(filters);
      if (data.success) {
        setDoctors(data.data);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [searchParams, minFees, maxFees]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = {};
    if (search) newParams.search = search;
    if (specialization && specialization !== 'All') newParams.specialization = specialization;
    setSearchParams(newParams);
  };

  const handleSpecSelect = (spec) => {
    setSpecialization(spec);
    const newParams = {};
    if (search) newParams.search = search;
    if (spec !== 'All') newParams.specialization = spec;
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSpecialization('All');
    setMinFees('');
    setMaxFees('');
    setSearchParams({});
  };

  const specializations = [
    'All',
    'Cardiology',
    'Dermatology',
    'Pediatrics',
    'Neurology',
    'Orthopedics',
    'General Medicine',
  ];

  return (
    <div className="container section">
      <div className="section-header" style={{ marginBottom: '30px', textAlign: 'left', maxWidth: '100%' }}>
        <h2 className="section-title">Find Clinical Specialists</h2>
        <p className="section-subtitle">Search, filter, and schedule consultations with verified doctors.</p>
      </div>

      <div className="listings-layout">
        {/* Sidebar Filters */}
        <aside className="glass-card filters-sidebar">
          <h3 className="sidebar-title">
            <Filter size={18} /> Filters
          </h3>

          {/* Specialization Filter */}
          <div className="filter-section">
            <h4>Specialization</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              {specializations.map((spec) => (
                <button
                  key={spec}
                  onClick={() => handleSpecSelect(spec)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    textAlign: 'left',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    transition: 'var(--transition-fast)',
                    background: specialization === spec ? 'var(--bg-tag)' : 'transparent',
                    color: specialization === spec ? 'var(--primary)' : 'var(--text-secondary)',
                    border: specialization === spec ? '1px solid rgba(37,99,235,0.2)' : '1px solid transparent',
                  }}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          {/* Fees range filter */}
          <div className="filter-section" style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
            <h4>Consultation Fee ($)</h4>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <input
                type="number"
                placeholder="Min"
                className="input-field"
                value={minFees}
                onChange={(e) => setMinFees(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', fontSize: '13px' }}
              />
              <input
                type="number"
                placeholder="Max"
                className="input-field"
                value={maxFees}
                onChange={(e) => setMaxFees(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', fontSize: '13px' }}
              />
            </div>
          </div>

          <button onClick={handleResetFilters} className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '10px' }}>
            Reset All Filters
          </button>
        </aside>

        {/* Listings Content */}
        <div>
          <div className="listings-header">
            <form onSubmit={handleSearchSubmit} className="search-bar" style={{ width: '100%' }}>
              <Search size={18} />
              <input
                type="text"
                placeholder="Search name, keyword or specific medical practice..."
                className="input-field glass-card"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%' }}
              />
            </form>
          </div>

          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Loading matching doctors list...
            </div>
          ) : doctors.length > 0 ? (
            <div className="doctors-grid">
              {doctors.map((doc) => (
                <DoctorCard key={doc._id} doctor={doc} />
              ))}
            </div>
          ) : (
            <div className="glass-card empty-state" style={{ padding: '80px 40px' }}>
              <Stethoscope size={48} style={{ color: 'var(--text-muted)' }} />
              <h3>No Specialists Found</h3>
              <p>Try modifying your search text or removing the filters to discover more clinics.</p>
              <button onClick={handleResetFilters} className="btn btn-primary">
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorList;
