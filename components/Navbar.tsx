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
            {/* Main Bar */}
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* Hamburger Icon (Mobile Only) */}
                    <button
                        className="visible-mobile"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '0.2rem' }}
                    >
                        ☰
                    </button>

                    {/* Logo */}
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>
                        <span style={{ color: 'var(--primary)' }}>Snack</span>Bazaar
                    </Link>
                </div>

                {/* Search Bar (Desktop) */}
                <form onSubmit={handleSearch} className="hidden-mobile" style={{ flex: '0 1 400px' }}>
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

                {/* Icons */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {/* Desktop Links */}
                    <div className="hidden-mobile" style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', fontWeight: '500', marginRight: '1rem' }}>
                        <Link to="/">Home</Link>
                        <Link to="/shop">Shop</Link>
                        {user?.email === 'admin@example.com' && <Link to="/admin/orders">Admin</Link>}
                    </div>

                    <Link to="/cart" style={{ position: 'relative' }}>
                        <span style={{ fontSize: '1.2rem' }}>🛒</span>
                        {cartCount > 0 && (
                            <span style={{
                                position: 'absolute', top: '-8px', right: '-8px',
                                background: 'var(--primary)', color: '#fff',
                                borderRadius: '50%', width: '18px', height: '18px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '10px', fontWeight: 'bold'
                            }}>
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                            ) : (
                                <span style={{ fontSize: '1.2rem' }}>👤</span>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8rem' }}>
                                <Link to="/my-orders" style={{ fontWeight: 'bold' }}>My Orders</Link>
                                <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, color: '#666' }}>Logout</button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={loginWithGoogle}
                            style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                            Login
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div style={{
                    position: 'absolute', top: '80px', left: 0, right: 0,
                    background: '#fff', borderBottom: '1px solid #eee',
                    padding: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}>
                    <form onSubmit={handleSearch} style={{ marginBottom: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ width: '100%', padding: '0.6rem 1rem', background: '#f5f5f5', border: '1px solid #e5e7eb', borderRadius: '4px' }}
                        />
                    </form>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontWeight: '500' }}>
                        <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
                        <Link to="/shop" onClick={() => setIsMenuOpen(false)}>Shop</Link>
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
