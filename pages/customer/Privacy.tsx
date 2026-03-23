import React from 'react';

const Privacy: React.FC = () => {
  return (
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '900px' }}>
      <h1 className="section-title">Privacy Policy</h1>
      <div style={{ lineHeight: '1.8', color: '#4b5563', fontSize: '0.95rem' }}>
        <p>At Gourmetify, we are committed to protecting your privacy. This policy explains how we collect and use your data.</p>
        
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '1.5rem 0 1rem', color: '#1f2937' }}>Information Collection</h2>
        <p>We collect information you provide directly to us when you create an account, make a purchase, or communicate with us. This includes your name, email, shipping address, and phone number.</p>
        
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '1.5rem 0 1rem', color: '#1f2937' }}>Use of Information</h2>
        <p>We use your information to process orders, provide customer support, and send you updates about our service and special offers.</p>
        
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '1.5rem 0 1rem', color: '#1f2937' }}>Data Security</h2>
        <p>We implement a variety of security measures to maintain the safety of your personal information. Your payment data is handled by secure third-party processors like Razorpay.</p>
      </div>
    </div>
  );
};

export default Privacy;
