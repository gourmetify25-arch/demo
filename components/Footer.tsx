import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer style={{ background: '#F9FAFB', paddingTop: '4rem', paddingBottom: '2rem', borderTop: '1px solid #eee', marginTop: '4rem' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>

                    {/* Brand */}
                    <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img src="/gourmetify.jpg" alt="Gourmetify" style={{ height: '30px', borderRadius: '4px' }} />
                            <span style={{ color: 'var(--primary)' }}>Gourmetify</span>
                        </h3>
                        <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.6' }}>
                            Authentic Indian flavors delivered to your doorstep. From spicy banana chips to sweet mysore pak.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Shop</h4>
                        <ul style={{ listStyle: 'none', color: '#666', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <li><Link to="/shop">All Products</Link></li>
                            <li><Link to="/shop?cat=Chips">Chips</Link></li>
                            <li><Link to="/shop?cat=Sweets">Sweets</Link></li>
                            <li><Link to="/shop?cat=Nuts">Nuts</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Support</h4>
                        <ul style={{ listStyle: 'none', color: '#666', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <li><a href="#">Contact Us</a></li>
                            <li><a href="#">Shipping Policy</a></li>
                            <li><a href="#">Returns & Refunds</a></li>
                            <li><a href="#">FAQs</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Contact</h4>
                        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>📍 123 Snack St, Bangalore</p>
                        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>📞 +91 98765 43210</p>
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>✉️ support@gourmetify.com</p>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '2rem', textAlign: 'center', color: '#999', fontSize: '0.8rem' }}>
                    &copy; {new Date().getFullYear()} Gourmetify. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
