import React from 'react';
import { NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const MobileBottomNav: React.FC = () => {
  const { cart } = useCart();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <div className="mobile-bottom-nav">
        <NavLink to="/" end className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <span className="material-symbols-outlined">home</span>
          <span>Home</span>
        </NavLink>

        <NavLink to="/shop" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <span className="material-symbols-outlined">storefront</span>
          <span>Shop</span>
        </NavLink>

        <NavLink to="/categories" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <span className="material-symbols-outlined">grid_view</span>
          <span>Categories</span>
        </NavLink>

        <NavLink to="/cart" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`} style={{ position: 'relative' }}>
          <span className="material-symbols-outlined">shopping_cart</span>
          <span>Cart</span>
          {cartCount > 0 && (
            <span style={{
              position: 'absolute', top: '0', right: '15.5%',
              background: 'var(--primary)', color: '#fff',
              borderRadius: '50%', width: '16px', height: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '9px', fontWeight: 'bold'
            }}>
              {cartCount}
            </span>
          )}
        </NavLink>

        <a href="https://wa.me/917510141171" target="_blank" rel="noopener noreferrer" className="mobile-nav-item">
          <span className="material-symbols-outlined">chat</span>
          <span>Contact</span>
        </a>
      </div>

      {/* Separate WhatsApp Float Button */}
      <a 
        href="https://wa.me/917510141171" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="whatsapp-float visible-mobile"
      >
        <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" style={{ width: '30px', height: '30px' }} />
      </a>
    </>
  );
};

export default MobileBottomNav;
