import React from 'react';

const Terms: React.FC = () => {
  return (
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '900px' }}>
      <h1 className="section-title">Terms & Conditions</h1>
      <div style={{ lineHeight: '1.8', color: '#4b5563', fontSize: '0.95rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '1.5rem 0 1rem', color: '#1f2937' }}>1. Introduction</h2>
        <p>By using Gourmetify, you agree to comply with and be bound by the following terms and conditions of use, which together with our privacy policy govern our relationship with you.</p>
        
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '1.5rem 0 1rem', color: '#1f2937' }}>2. Intellectual Property</h2>
        <p>The content, layout, design, data, and graphics on this website are protected by Indian intellectual property laws. You may not reproduce, download, or distribute any part of this site without permission.</p>
        
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '1.5rem 0 1rem', color: '#1f2937' }}>3. Order Cancellation</h2>
        <p>Orders can be cancelled before they are dispatched. Once an order is shipped, cancellation is not possible. Gourmetify reserves the right to cancel orders in case of stock unavailability or technical errors.</p>
        
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '1.5rem 0 1rem', color: '#1f2937' }}>4. Limitation of Liability</h2>
        <p>Gourmetify shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use our services.</p>
      </div>
    </div>
  );
};

export default Terms;
