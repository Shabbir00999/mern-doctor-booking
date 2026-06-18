import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { appointmentAPI, doctorAPI } from '../services/api';
import { Calendar, Clock, Check, X, ShieldAlert, Settings } from 'lucide-react';

const DoctorDashboard = () => {
  const { doctorProfile, updateDoctorProfileState } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' or 'settings'

  // Settings State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState('');
  const [fees, setFees] = useState('');
  const [qualification, setQualification] = useState('');
  const [bio, setBio] = useState('');
  
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [settingsError, setSettingsError] = useState('');

  // Fetch Doctor Appointments
  const fetchAppointments = async () => {
    try {
      const data = await appointmentAPI.getDoctorAppointments();
      if (data.success) {
        setAppointments(data.data);
      }
    } catch (err) {
      console.error('Error fetching doctor appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Prepopulate settings form
  useEffect(() => {
    if (doctorProfile) {
      setName(doctorProfile.user?.name || '');
      setPhone(doctorProfile.user?.phone || '');
      setSpecialization(doctorProfile.specialization || '');
      setExperience(doctorProfile.experience || '');
      setFees(doctorProfile.fees || '');
      setQualification(doctorProfile.qualification || '');
      setBio(doctorProfile.bio || '');
    }
  }, [doctorProfile]);

  // Update status (Approve/Cancel)
  const handleUpdateStatus = async (apptId, status) => {
    const action = status === 'approved' ? 'approve' : 'cancel';
    const confirmAction = window.confirm(`Are you sure you want to ${action} this appointment?`);
    if (!confirmAction) return;

    try {
      const data = await appointmentAPI.updateStatus(apptId, status);
      if (data.success) {
        alert(`Appointment ${status} successfully`);
        fetchAppointments();
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Network error';
      alert(message);
    }
  };

  // Update Doctor Profile Settings
  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsSuccess(false);
    setSettingsError('');

    try {
      const data = await doctorAPI.updateProfile({
        name,
        phone,
        specialization,
        experience: Number(experience),
        fees: Number(fees),
        qualification,
        bio,
      });

      if (data.success) {
        setSettingsSuccess(true);
        updateDoctorProfileState(data.data);
      } else {
        setSettingsError(data.message || 'Failed to update profile settings');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Settings update failed';
      setSettingsError(message);
    } finally {
      setSettingsLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading doctor dashboard...</div>;
  }

  const pendingAppts = appointments.filter((a) => a.status === 'pending');
  const approvedAppts = appointments.filter((a) => a.status === 'approved');

  return (
    <div className="container section">
      <div className="section-header" style={{ marginBottom: '30px', textAlign: 'left', maxWidth: '100%' }}>
        <h2 className="section-title">Doctor Panel</h2>
        <p className="section-subtitle">Manage patient consultations, scheduling, and profile settings.</p>
      </div>

      <div className="dashboard-layout">
        {/* Sidebar Nav */}
        <aside className="dashboard-nav">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`dash-nav-btn ${activeTab === 'appointments' ? 'active' : ''}`}
          >
            <Calendar size={18} /> Appointments ({appointments.length})
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            className={`dash-nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
          >
            <Settings size={18} /> Profile Settings
          </button>
          
          {doctorProfile && !doctorProfile.isApproved && (
            <div style={{ marginTop: '20px', padding: '16px', borderRadius: '12px', background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.15)', color: 'var(--warning)', fontSize: '12.5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', marginBottom: '6px' }}>
                <ShieldAlert size={16} /> Pending Approval
              </div>
              Your profile is pending admin approval. You will not appear in search results until verified.
            </div>
          )}
        </aside>

        {/* Panel Content */}
        <main className="glass-card dash-panel" style={{ padding: '24px' }}>
          {activeTab === 'appointments' && (
            <>
              <div className="dash-panel-header">
                <h3>Patient Consultations</h3>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {pendingAppts.length} pending / {approvedAppts.length} approved
                </span>
              </div>

              {appointments.length > 0 ? (
                <div className="table-wrapper">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Contact</th>
                        <th>Date & Time</th>
                        <th>Notes</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appt) => {
                        const pat = appt.patient;
                        return (
                          <tr key={appt._id}>
                            <td>
                              <strong style={{ color: 'var(--text-bright)' }}>{pat ? pat.name : 'Unknown Patient'}</strong>
                            </td>
                            <td>
                              <p style={{ fontSize: '13px' }}>{pat ? pat.phone : 'N/A'}</p>
                              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{pat ? pat.email : ''}</p>
                            </td>
                            <td>
                              <p style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-bright)' }}>
                                <Calendar size={12} /> {appt.date}
                              </p>
                              <p style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                <Clock size={12} /> {appt.timeSlot}
                              </p>
                            </td>
                            <td>
                              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={appt.notes}>
                                {appt.notes || <span style={{ color: 'var(--text-muted)' }}>No symptoms specified</span>}
                              </p>
                            </td>
                            <td>
                              <span className={`status-badge status-${appt.status}`}>
                                {appt.status}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '8px' }}>
                                {appt.status === 'pending' && (
                                  <button
                                    onClick={() => handleUpdateStatus(appt._id, 'approved')}
                                    className="btn btn-success btn-sm"
                                    title="Approve Slot"
                                    style={{ padding: '6px' }}
                                  >
                                    <Check size={14} />
                                  </button>
                                )}
                                
                                {appt.status !== 'cancelled' && (
                                  <button
                                    onClick={() => handleUpdateStatus(appt._id, 'cancelled')}
                                    className="btn btn-danger btn-sm"
                                    title="Cancel Slot"
                                    style={{ padding: '6px' }}
                                  >
                                    <X size={14} />
                                  </button>
                                )}
                                {appt.status === 'cancelled' && (
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Inactive</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <Calendar size={48} />
                  <p>No appointments have been booked with you yet.</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'settings' && (
            <>
              <div className="dash-panel-header">
                <h3>Profile Settings</h3>
              </div>

              {settingsSuccess && (
                <div className="alert alert-success">
                  Clinical profile details updated successfully!
                </div>
              )}

              {settingsError && (
                <div className="alert alert-danger">
                  {settingsError}
                </div>
              )}

              <form onSubmit={handleUpdateSettings}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Display Name</label>
                    <input
                      id="name"
                      type="text"
                      className="input-field"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Contact Phone</label>
                    <input
                      id="phone"
                      type="tel"
                      className="input-field"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="specialization">Specialization</label>
                    <input
                      id="specialization"
                      type="text"
                      className="input-field"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="experience">Experience (Years)</label>
                    <input
                      id="experience"
                      type="number"
                      className="input-field"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fees">Consultation Fee ($)</label>
                    <input
                      id="fees"
                      type="number"
                      className="input-field"
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
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label htmlFor="bio">Professional Summary</label>
                  <textarea
                    id="bio"
                    className="input-field"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    style={{ minHeight: '120px', resize: 'vertical' }}
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={settingsLoading}>
                  {settingsLoading ? 'Saving changes...' : 'Save Settings'}
                </button>
              </form>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;
