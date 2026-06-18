import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import { Users, UserCheck, Calendar, DollarSign, Trash2, Award } from 'lucide-react';

const AdminDashboard = () => {
  const { token } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats'); // 'stats', 'verify-doctors', 'users', 'appointments'

  const fetchData = async () => {
    try {
      setLoading(true);

      const [statsData, usersData, doctorsData, apptsData] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        adminAPI.getDoctors(),
        adminAPI.getAppointments(),
      ]);

      if (statsData.success) setStats(statsData.stats);
      if (usersData.success) setUsers(usersData.data);
      if (doctorsData.success) setDoctors(doctorsData.data);
      if (apptsData.success) setAppointments(apptsData.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Approve / Revoke Doctor
  const handleApproveDoctor = async (doctorId, currentStatus) => {
    const nextStatus = !currentStatus;
    const confirmMsg = nextStatus
      ? 'Do you want to verify and approve this doctor profile?'
      : 'Do you want to revoke verification for this doctor?';
    if (!window.confirm(confirmMsg)) return;

    try {
      const data = await adminAPI.approveDoctor(doctorId, nextStatus);
      if (data.success) {
        alert(data.message);
        fetchData();
      } else {
        alert(data.message || 'Failed to update approval status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating doctor verification status.');
    }
  };

  // Delete User (Patient or Doctor)
  const handleDeleteUser = async (userId, userRole) => {
    const roleText = userRole === 'doctor' ? 'doctor profile and credentials' : 'user account';
    if (!window.confirm(`Are you sure you want to delete this ${roleText}? This will permanently remove all associated appointments.`)) return;

    try {
      const data = await adminAPI.deleteUser(userId);
      if (data.success) {
        alert(data.message);
        fetchData();
      } else {
        alert(data.message || 'Failed to delete user');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting user.');
    }
  };

  if (loading) {
    return <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading administrative dashboard...</div>;
  }

  return (
    <div className="container section">
      <div className="section-header" style={{ marginBottom: '30px', textAlign: 'left', maxWidth: '100%' }}>
        <h2 className="section-title">Admin Dashboard</h2>
        <p className="section-subtitle">Overview statistics, verify clinical personnel, and audit bookings.</p>
      </div>

      <div className="dashboard-layout">
        {/* Sidebar Nav */}
        <aside className="dashboard-nav">
          <button
            onClick={() => setActiveTab('stats')}
            className={`dash-nav-btn ${activeTab === 'stats' ? 'active' : ''}`}
          >
            <DollarSign size={18} /> Aggregate Metrics
          </button>
          
          <button
            onClick={() => setActiveTab('verify-doctors')}
            className={`dash-nav-btn ${activeTab === 'verify-doctors' ? 'active' : ''}`}
          >
            <UserCheck size={18} /> Verify Doctors ({doctors.filter(d => !d.isApproved).length} pending)
          </button>
          
          <button
            onClick={() => setActiveTab('users')}
            className={`dash-nav-btn ${activeTab === 'users' ? 'active' : ''}`}
          >
            <Users size={18} /> Manage Patients ({users.length})
          </button>
          
          <button
            onClick={() => setActiveTab('appointments')}
            className={`dash-nav-btn ${activeTab === 'appointments' ? 'active' : ''}`}
          >
            <Calendar size={18} /> Auditing Bookings ({appointments.length})
          </button>
        </aside>

        {/* Panel View */}
        <main className="glass-card dash-panel" style={{ padding: '24px' }}>
          {activeTab === 'stats' && stats && (
            <>
              <div className="dash-panel-header">
                <h3>Aggregate Metrics</h3>
              </div>

              <div className="card-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                <div className="glass-card stat-card">
                  <div className="stat-card-icon stat-card-blue">
                    <Users size={20} />
                  </div>
                  <div className="stat-card-info">
                    <h3>{stats.totalPatients}</h3>
                    <p>Total Patients</p>
                  </div>
                </div>

                <div className="glass-card stat-card">
                  <div className="stat-card-icon stat-card-orange">
                    <Award size={20} />
                  </div>
                  <div className="stat-card-info">
                    <h3>{stats.totalDoctors}</h3>
                    <p>Total Doctors</p>
                  </div>
                </div>

                <div className="glass-card stat-card">
                  <div className="stat-card-icon stat-card-green">
                    <Calendar size={20} />
                  </div>
                  <div className="stat-card-info">
                    <h3>{stats.totalAppointments}</h3>
                    <p>Total Bookings</p>
                  </div>
                </div>

                <div className="glass-card stat-card">
                  <div className="stat-card-icon stat-card-blue" style={{ background: 'rgba(13,148,136,0.1)', color: 'var(--secondary)' }}>
                    <DollarSign size={20} />
                  </div>
                  <div className="stat-card-info">
                    <h3>${stats.totalEarnings}</h3>
                    <p>Projected Revenue</p>
                  </div>
                </div>
              </div>

              <div style={{ padding: '20px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '12px', marginTop: '24px' }}>
                <h4 style={{ color: 'var(--text-bright)', marginBottom: '12px' }}>Doctor Verification Status</h4>
                <div style={{ display: 'flex', gap: '30px' }}>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Approved Medical Staff: <strong style={{ color: 'var(--success)' }}>{stats.approvedDoctors}</strong></p>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Pending Verification: <strong style={{ color: 'var(--warning)' }}>{stats.pendingDoctors}</strong></p>
                </div>
              </div>
            </>
          )}

          {activeTab === 'verify-doctors' && (
            <>
              <div className="dash-panel-header">
                <h3>Doctor Verification Portal</h3>
              </div>

              {doctors.length > 0 ? (
                <div className="table-wrapper">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Doctor</th>
                        <th>Credentials</th>
                        <th>Fees</th>
                        <th>Verification</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctors.map((doc) => {
                        const dName = doc.user ? doc.user.name : 'Unknown Doctor';
                        return (
                          <tr key={doc._id}>
                            <td>
                              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <img
                                  src={doc.image}
                                  alt={dName}
                                  style={{ width: '40px', height: '40px', borderRadius: '5px', objectFit: 'cover', background: '#141b2a' }}
                                  onError={(e) => { e.target.src = '/uploads/default-doctor.png'; }}
                                />
                                <div>
                                  <strong style={{ color: 'var(--text-bright)' }}>{dName}</strong>
                                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{doc.specialization}</p>
                                </div>
                              </div>
                            </td>
                            <td>
                              <p style={{ fontSize: '13px' }}>{doc.qualification}</p>
                              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{doc.experience} years exp</p>
                            </td>
                            <td>
                              <strong style={{ color: 'var(--text-bright)' }}>${doc.fees}</strong>
                            </td>
                            <td>
                              <span className={`status-badge status-${doc.isApproved ? 'approved' : 'pending'}`}>
                                {doc.isApproved ? 'Approved' : 'Pending'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '8px' }}>
                                <button
                                  onClick={() => handleApproveDoctor(doc._id, doc.isApproved)}
                                  className={`btn ${doc.isApproved ? 'btn-secondary' : 'btn-success'} btn-sm`}
                                  style={{ padding: '6px 12px' }}
                                >
                                  {doc.isApproved ? 'Revoke' : 'Approve'}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(doc.user?._id, 'doctor')}
                                  className="btn btn-danger btn-sm"
                                  style={{ padding: '6px' }}
                                  title="Delete Doctor"
                                >
                                  <Trash2 size={14} />
                                </button>
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
                  <UserCheck size={48} />
                  <p>No doctor profiles exist in the database.</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'users' && (
            <>
              <div className="dash-panel-header">
                <h3>Manage Patient Records</h3>
              </div>

              {users.length > 0 ? (
                <div className="table-wrapper">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Patient Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Joined Date</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id}>
                          <td>
                            <strong style={{ color: 'var(--text-bright)' }}>{u.name}</strong>
                          </td>
                          <td>{u.email}</td>
                          <td>{u.phone || <span style={{ color: 'var(--text-muted)' }}>N/A</span>}</td>
                          <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              onClick={() => handleDeleteUser(u._id, 'patient')}
                              className="btn btn-danger btn-sm"
                              style={{ padding: '6px' }}
                              title="Delete Patient Account"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <Users size={48} />
                  <p>No registered patient accounts found.</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'appointments' && (
            <>
              <div className="dash-panel-header">
                <h3>Auditing Bookings History</h3>
              </div>

              {appointments.length > 0 ? (
                <div className="table-wrapper">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Doctor</th>
                        <th>Date & Time</th>
                        <th>Consult Fee</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appt) => {
                        const patName = appt.patient ? appt.patient.name : 'Deleted Patient';
                        const docName = appt.doctor && appt.doctor.user ? appt.doctor.user.name : 'Deleted Doctor';
                        const docFees = appt.doctor ? appt.doctor.fees : 0;
                        return (
                          <tr key={appt._id}>
                            <td>
                              <strong style={{ color: 'var(--text-bright)' }}>{patName}</strong>
                            </td>
                            <td>
                              <strong style={{ color: 'var(--text-bright)' }}>{docName}</strong>
                              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                {appt.doctor ? appt.doctor.specialization : ''}
                              </p>
                            </td>
                            <td>
                              <p style={{ fontSize: '13px' }}>{appt.date}</p>
                              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{appt.timeSlot}</p>
                            </td>
                            <td>
                              <strong style={{ color: 'var(--text-bright)' }}>${docFees}</strong>
                            </td>
                            <td>
                              <span className={`status-badge status-${appt.status}`}>
                                {appt.status}
                              </span>
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
                  <p>No bookings have been logged in the system.</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
