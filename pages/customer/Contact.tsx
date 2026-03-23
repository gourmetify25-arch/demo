import React from 'react';

const Contact: React.FC = () => {
  return (
    <div className="container" style={{ padding: '4rem 1rem' }}>
      <h1 className="section-title">Contact Us</h1>
      <div className="grid-2-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Get in Touch</h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            Have questions about our products or your order? We're here to help!
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>location_on</span>
              <div>
                <h3 style={{ fontWeight: '600' }}>Our Location</h3>
                <p style={{ color: '#4b5563', fontSize: '0.9rem' }}>Opp Moulana Hospital, Ootty Road, Perinthalmanna, Kerala</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>call</span>
              <div>
                <h3 style={{ fontWeight: '600' }}>Phone</h3>
                <p style={{ color: '#4b5563', fontSize: '0.9rem' }}>+91 75101 41171</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>mail</span>
              <div>
                <h3 style={{ fontWeight: '600' }}>Email</h3>
                <p style={{ color: '#4b5563', fontSize: '0.9rem' }}>gourmetify25@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
        
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>Full Name</label>
            <input type="text" placeholder="John Doe" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>Email Address</label>
            <input type="email" placeholder="john@example.com" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>Message</label>
            <textarea style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '0.375rem', height: '120px' }} placeholder="How can we help?"></textarea>
          </div>
          <button type="button" className="btn btn-primary" style={{ marginTop: '1rem' }}>Send Message</button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
