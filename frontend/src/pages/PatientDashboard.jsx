import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { appointmentAPI } from '../services/api';
import { Calendar, Clock, XCircle, Stethoscope, FileText, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const PatientDashboard = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const data = await appointmentAPI.getPatientAppointments();
      if (data.success) {
        setAppointments(data.data);
      }
    } catch (err) {
      console.error('Error fetching patient appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancelAppointment = async (apptId) => {
    const confirmCancel = window.confirm('Are you sure you want to cancel this appointment?');
    if (!confirmCancel) return;

    try {
      const data = await appointmentAPI.updateStatus(apptId, 'cancelled');
      if (data.success) {
        alert('Appointment cancelled successfully');
        fetchAppointments();
      } else {
        alert(data.message || 'Failed to cancel appointment');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Cancellation error';
      alert(message);
    }
  };

  if (loading) {
    return <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading your dashboard panel...</div>;
  }

  const activeAppts = appointments.filter((a) => a.status !== 'cancelled');
  const cancelledAppts = appointments.filter((a) => a.status === 'cancelled');

  return (
    <div className="container section">
      <div className="section-header" style={{ marginBottom: '30px', textAlign: 'left', maxWidth: '100%' }}>
        <h2 className="section-title">Patient Dashboard</h2>
        <p className="section-subtitle">Manage your medical appointments, bookings, and care schedules.</p>
      </div>

      <div className="card-stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-card-icon stat-card-blue">
            <Calendar size={24} />
          </div>
          <div className="stat-card-info">
            <h3>{appointments.length}</h3>
            <p>Total Bookings</p>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-card-icon stat-card-green">
            <Activity size={24} />
          </div>
          <div className="stat-card-info">
            <h3>{activeAppts.length}</h3>
            <p>Active Appointments</p>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-card-icon stat-card-red">
            <XCircle size={24} />
          </div>
          <div className="stat-card-info">
            <h3>{cancelledAppts.length}</h3>
            <p>Cancelled Bookings</p>
          </div>
        </div>
      </div>

      <div className="glass-card dash-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
          Your Appointment History
        </h3>

        {appointments.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {appointments.map((appt) => {
              const doc = appt.doctor;
              const docName = doc?.user ? doc.user.name : 'Verified Doctor';
              const docSpec = doc ? doc.specialization : 'Specialist';
              const docImg = doc ? doc.image : '/uploads/default-doctor.png';
              
              return (
                <div
                  key={appt._id}
                  className="glass-card"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '20px',
                    borderLeft: appt.status === 'approved' ? '4px solid var(--success)' : appt.status === 'cancelled' ? '4px solid var(--danger)' : '4px solid var(--warning)'
                  }}
                >
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <img
                      src={docImg}
                      alt={docName}
                      style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', background: '#141b2a' }}
                      onError={(e) => { e.target.src = '/uploads/default-doctor.png'; }}
                    />
                    <div>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: '700' }}>
                        {docSpec}
                      </span>
                      <h4 style={{ fontSize: '16px', color: 'var(--text-bright)', margin: '2px 0' }}>{docName}</h4>
                      
                      <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} /> {new Date(appt.date + 'T00:00:00').toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} /> {appt.timeSlot}
                        </span>
                      </div>
                      
                      {appt.notes && (
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FileText size={12} /> Notes: "{appt.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span className={`status-badge status-${appt.status}`}>
                      {appt.status}
                    </span>

                    {appt.status !== 'cancelled' && (
                      <button
                        onClick={() => handleCancelAppointment(appt._id)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '6px 12px' }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <Stethoscope size={48} />
            <p>You have not booked any appointments yet.</p>
            <Link to="/doctors" className="btn btn-primary">
              Book a Doctor Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
