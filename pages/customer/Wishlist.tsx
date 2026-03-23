import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

const Wishlist: React.FC = () => {
    const { wishlist, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();

    return (
        <div className="container" style={{ padding: '4rem 1rem' }}>
            <h1 className="section-title">My Wishlist</h1>
            
            {wishlist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: '#ccc', marginBottom: '1rem' }}>favorite_border</span>
                    <h3>Your wishlist is empty</h3>
                    <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Save items you like to see them here.</p>
                    <Link to="/shop" className="btn btn-primary">Go to Shop</Link>
                </div>
            ) : (
                <div className="grid-products">
                    {wishlist.map((product) => (
                        <div key={product.id} className="card" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                            <button 
                                onClick={() => removeFromWishlist(product.id)}
                                style={{ position: 'absolute', top: '10px', right: '10px', background: '#fff', border: 'none', borderRadius: '50%', padding: '5px', cursor: 'pointer', zIndex: 1, boxShadow: 'var(--shadow)' }}
                            >
                                <span className="material-symbols-outlined" style={{ color: 'var(--danger)', fontSize: '1.2rem' }}>close</span>
                            </button>
                            <div style={{ height: '220px', overflow: 'hidden' }}>
                                <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                    <Link to={`/product/${product.id}`}>{product.name}</Link>
                                </h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                    <span style={{ fontWeight: 'bold' }}>₹{product.price}</span>
                                    <button onClick={() => addToCart(product)} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
