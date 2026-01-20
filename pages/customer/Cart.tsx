import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const Cart: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, subtotal, shippingCost, total, totalWeight, chargeableWeight } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Your Cart is Empty</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>Add some delicious snacks to get started!</p>
        <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <h1 className="section-title">Your Cart</h1>

      <div className="grid-1-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '3rem', alignItems: 'start' }}>

        {/* Cart Items List */}
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #eee', overflow: 'hidden' }}>
          {cart.map((item) => (
            <div key={item.id} style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', borderBottom: '1px solid #eee', alignItems: 'center' }}>
              <img src={item.image} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', background: '#f9f9f9' }} />

              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>{item.name}</h3>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>{item.weight}g per pack</p>
                <button
                  onClick={() => removeFromCart(item.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.8rem', padding: 0, marginTop: '0.5rem', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Remove
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px' }}>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  style={{ padding: '0.4rem 0.8rem', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  -
                </button>
                <span style={{ padding: '0 0.5rem', fontWeight: 'bold', minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  style={{ padding: '0.4rem 0.8rem', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  +
                </button>
              </div>

              <div style={{ fontWeight: 'bold', fontSize: '1.1rem', minWidth: '80px', textAlign: 'right' }}>
                ₹{item.price * item.quantity}
              </div>
            </div>
          ))}

          <div style={{ padding: '1rem', background: '#F9FAFB', fontSize: '0.9rem', color: '#666', borderTop: '1px solid #eee' }}>
            <span style={{ marginRight: '1rem' }}>Add ₹150 more to unlock Free Shipping!</span>
            <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}>Continue Shopping</span>
          </div>
        </div>

        {/* Order Summary */}
        <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', border: '1px solid #eee' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Order Summary</h3>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#666' }}>
            <span>Subtotal ({cart.length} items)</span>
            <span>₹{subtotal}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#666' }}>
            <span>Total Weight</span>
            <span>{totalWeight}g ({chargeableWeight}kg chargeable)</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#666' }}>
            <span>Shipping</span>
            <span>₹{shippingCost}</span>
          </div>

          <div style={{ borderTop: '1px solid #eee', margin: '1rem 0' }}></div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
            <span>Total Amount</span>
            <span>₹{total}</span>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <input type="text" placeholder="Promo Code" style={{ marginBottom: '0.5rem', background: '#f5f5f5' }} />
            <button className="btn btn-outline" style={{ width: '100%', padding: '0.5rem' }}>Apply</button>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            Proceed to Checkout &rarr;
          </button>

          <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: '#999', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <span>🔒 Secure Payment</span>
            <span>🛡️ 100% Authentic</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Cart;