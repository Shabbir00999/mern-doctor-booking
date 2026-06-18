import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Github, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <Stethoscope size={24} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle', color: '#2563eb' }} />
              DocReserve<span>.</span>
            </div>
            <p className="footer-desc">
              Book consultations with top-rated medical professionals in minutes. Healthcare simplified.
            </p>
          </div>

          <div className="footer-links">
            <h4>Services</h4>
            <ul>
              <li><Link to="/doctors?specialization=Cardiology">Cardiology</Link></li>
              <li><Link to="/doctors?specialization=Dermatology">Dermatology</Link></li>
              <li><Link to="/doctors?specialization=Pediatrics">Pediatrics</Link></li>
              <li><Link to="/doctors?specialization=Neurology">Neurology</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/doctors">Find Doctors</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Contact Us</h4>
            <ul style={{ color: '#94a3b8', fontSize: '13px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={14} /> 123 Health Ave, Suite 100
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} /> +1 (555) 019-2834
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={14} /> contact@docreserve.com
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} DocReserve. All rights reserved. Designed with premium medical care in mind.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
