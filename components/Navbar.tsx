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

                {/* Logo (Left Side) */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>
                    <img src="/gourmetify.jpg" alt="Gourmetify" style={{ height: '40px', borderRadius: '4px' }} />
                    <span style={{ color: 'var(--primary)' }}>Gourmetify</span>
                </Link>

                {/* Search Bar (Desktop Center) */}
                <form onSubmit={handleSearch} className="hidden-mobile" style={{ flex: '0 1 400px', margin: '0 2rem' }}>
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

                {/* Icons & Actions (Right Side) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

                    {/* Desktop Links */}
                    <div className="hidden-mobile" style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', fontWeight: '500', marginRight: '1rem' }}>
                        <Link to="/">Home</Link>
                        <Link to="/shop">Shop</Link>
                        {user?.email === 'gourmetify25@gmail.com' && <Link to="/admin/orders">Admin</Link>}
                    </div>

                    {/* Cart Icon */}
                    <Link to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1.6rem', color: '#333' }}>shopping_cart</span>
                        {cartCount > 0 && (
                            <span style={{
                                position: 'absolute', top: '-5px', right: '-5px',
                                background: 'var(--primary)', color: '#fff',
                                borderRadius: '50%', width: '18px', height: '18px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '10px', fontWeight: 'bold'
                            }}>
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {/* Profile Icon (Mobile & Desktop) */}
                    <Link to={user ? "/my-orders" : "/admin/login"} style={{ display: 'flex', alignItems: 'center' }}>
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="Profile" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #eee' }} />
                        ) : (
                            <span className="material-symbols-outlined" style={{ fontSize: '1.8rem', color: '#333' }}>account_circle</span>
                        )}
                    </Link>

                    {/* Desktop User Info (Hidden on Mobile) */}
                    {user ? (
                        <div className="hidden-mobile" style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8rem' }}>
                            <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#666' }}>Logout</button>
                        </div>
                    ) : (
                        <div className="hidden-mobile">
                            <button onClick={loginWithGoogle} style={{ fontSize: '0.9rem', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer' }}>Login</button>
                        </div>
                    )}

                    {/* Hamburger Menu (Mobile Only - Far Right) */}
                    <button
                        className="visible-mobile"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem', display: 'flex', alignItems: 'center' }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.8rem', color: '#333' }}>menu</span>
                    </button>
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
