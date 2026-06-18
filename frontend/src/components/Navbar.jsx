import React, { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Stethoscope, LogOut, User as UserIcon, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="nav-brand">
          <Stethoscope size={28} />
          DocReserve<span>.</span>
        </Link>

        <ul className="nav-menu">
          <li>
            <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/doctors" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Find Doctors
            </NavLink>
          </li>
          {user && (
            <li>
              {user.role === 'patient' && (
                <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                  My Appointments
                </NavLink>
              )}
              {user.role === 'doctor' && (
                <NavLink to="/doctor-dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                  Doctor Panel
                </NavLink>
              )}
              {user.role === 'admin' && (
                <NavLink to="/admin" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                  Admin Panel
                </NavLink>
              )}
            </li>
          )}
        </ul>

        <div className="nav-buttons">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="user-profile-badge">
                <UserIcon size={16} />
                <span>{user.name}</span>
                <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', textTransform: 'capitalize' }}>
                  {user.role}
                </span>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="nav-link" style={{ marginRight: '10px' }}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Book Now
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
