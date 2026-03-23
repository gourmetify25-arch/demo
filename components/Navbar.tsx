import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
    const { cart } = useCart();
    const { user, loginWithGoogle, logout } = useAuth();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const [isSupportOpen, setIsSupportOpen] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim()) {
            navigate(`/shop?search=${encodeURIComponent(search.trim())}`);
        } else {
            navigate('/shop');
        }
        setIsMenuOpen(false);
    };

    return (
        <nav style={{ borderBottom: '1px solid #eee', position: 'sticky', top: 0, background: '#fff', zIndex: 100 }}>
            {/* Top Bar (Logo + Icons) */}
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>

                {/* Left Side: Logo or Hamburger */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                        className="visible-mobile"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.8rem', color: '#333' }}>menu</span>
                    </button>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>
                        <img src="/gourmetify.jpg" alt="Gourmetify" style={{ height: '30px', borderRadius: '4px' }} />
                        <span style={{ color: 'var(--primary)' }} className="hidden-mobile">Gourmetify</span>
                        <span style={{ color: 'var(--primary)', fontSize: '1.1rem' }} className="visible-mobile">gourmetify</span>
                    </Link>
                </div>

                {/* Search Bar (Desktop Center) */}
                <form onSubmit={handleSearch} className="hidden-mobile" style={{ flex: '0 1 400px', margin: '0 1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search for chips, snacks..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ width: '100%', padding: '0.6rem 1rem', background: '#f5f5f5', border: 'none', borderRadius: '4px' }}
                        />
                    </div>
                </form>

                {/* Icons (Right Side) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    {/* Desktop Links */}
                    <div className="hidden-mobile" style={{ display: 'flex', gap: '1.2rem', fontSize: '0.9rem', fontWeight: '500', marginRight: '0.5rem', alignItems: 'center' }}>
                        <Link to="/">Home</Link>
                        <Link to="/shop">Shop</Link>
                        <Link to="/categories">Categories</Link>
                        <Link to="/about">About</Link>
                        <Link to="/contact">Contact</Link>
                        <div style={{ position: 'relative' }} onMouseEnter={() => setIsSupportOpen(true)} onMouseLeave={() => setIsSupportOpen(false)}>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '2px', padding: '0' }}>
                                Support <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>expand_more</span>
                            </button>
                            {isSupportOpen && (
                                <div style={{
                                    position: 'absolute', top: '100%', right: 0,
                                    background: '#fff', border: '1px solid #eee',
                                    borderRadius: '4px', padding: '0.5rem 0',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                    minWidth: '150px', zIndex: 1000
                                }}>
                                    <Link to="/faq" style={{ display: 'block', padding: '0.5rem 1rem' }}>FAQ</Link>
                                    <Link to="/terms" style={{ display: 'block', padding: '0.5rem 1rem' }}>Terms</Link>
                                    <Link to="/privacy" style={{ display: 'block', padding: '0.5rem 1rem' }}>Privacy</Link>
                                </div>
                            )}
                        </div>
                        {user?.email === 'gourmetify25@gmail.com' && <Link to="/admin/orders">Admin</Link>}
                    </div>

                    <Link to="/wishlist" style={{ color: '#333' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', verticalAlign: 'middle' }}>favorite</span>
                    </Link>

                    <Link to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', color: '#333' }}>shopping_cart</span>
                        {cartCount > 0 && (
                            <span style={{
                                position: 'absolute', top: '-5px', right: '-5px',
                                background: 'var(--primary)', color: '#fff',
                                borderRadius: '50%', width: '16px', height: '16px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '9px', fontWeight: 'bold'
                            }}>
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    <Link to={user ? "/my-orders" : "/admin/login"} style={{ display: 'flex', alignItems: 'center' }}>
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="Profile" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #eee' }} />
                        ) : (
                            <span className="material-symbols-outlined" style={{ fontSize: '1.6rem', color: '#333' }}>account_circle</span>
                        )}
                    </Link>
                </div>
            </div>

            {/* Mobile Search Bar Row */}
            <div className="container visible-mobile" style={{ paddingBottom: '1rem' }}>
                <form onSubmit={handleSearch} style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999', fontSize: '1.2rem' }}>search</span>
                    <input
                        type="text"
                        placeholder="Search for chips, snacks..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.5rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.9rem' }}
                    />
                </form>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    background: '#fff', borderBottom: '1px solid #eee',
                    padding: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontWeight: '500', maxHeight: '70vh', overflowY: 'auto' }}>
                        <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
                        <Link to="/shop" onClick={() => setIsMenuOpen(false)}>Shop</Link>
                        <Link to="/categories" onClick={() => setIsMenuOpen(false)}>Categories</Link>
                        <Link to="/about" onClick={() => setIsMenuOpen(false)}>About</Link>
                        <Link to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</Link>
                        <Link to="/faq" onClick={() => setIsMenuOpen(false)}>FAQ</Link>
                        <Link to="/terms" onClick={() => setIsMenuOpen(false)}>Terms & Conditions</Link>
                        <Link to="/privacy" onClick={() => setIsMenuOpen(false)}>Privacy Policy</Link>
                        <Link to="/wishlist" onClick={() => setIsMenuOpen(false)}>Wishlist</Link>
                        {user ? (
                            <>
                                <Link to="/my-orders" onClick={() => setIsMenuOpen(false)}>My Orders</Link>
                                <button onClick={() => { logout(); setIsMenuOpen(false); }} style={{ textAlign: 'left', background: 'none', border: 'none', fontSize: '1rem', fontWeight: '500' }}>Logout</button>
                            </>
                        ) : (
                            <button onClick={() => { loginWithGoogle(); setIsMenuOpen(false); }} style={{ textAlign: 'left', background: 'none', border: 'none', fontSize: '1rem', fontWeight: '500', color: 'var(--primary)' }}>Login</button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
