import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    showToast(`${product.name} added to cart!`, 'success');
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    navigate('/checkout');
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    const added = !isInWishlist(product.id);
    showToast(added ? `${product.name} added to wishlist!` : `${product.name} removed from wishlist!`, 'info');
  };

  const displayPrice = product.salePrice || product.price;
  const hasDiscount = product.mrp && product.mrp > displayPrice;
  const discountPercentage = hasDiscount ? Math.round(((product.mrp! - displayPrice) / product.mrp!) * 100) : 0;

  return (
    <div className="card product-card" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      position: 'relative',
      background: '#fff',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid #eee',
      height: '100%',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    }}>
      {/* Badges */}
      <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {product.featured && (
          <span style={{ 
            background: 'var(--danger)', 
            color: '#fff', 
            fontSize: '0.65rem', 
            fontWeight: 'bold', 
            padding: '2px 8px', 
            borderRadius: '4px',
            textTransform: 'uppercase'
          }}>
            Featured
          </span>
        )}
        {hasDiscount && (
          <span style={{ 
            background: '#22c55e', 
            color: '#fff', 
            fontSize: '0.65rem', 
            fontWeight: 'bold', 
            padding: '2px 8px', 
            borderRadius: '4px'
          }}>
            {discountPercentage}% OFF
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button 
        onClick={handleToggleWishlist}
        style={{ 
          position: 'absolute', 
          top: '10px', 
          right: '10px', 
          background: 'rgba(255,255,255,0.9)', 
          border: 'none', 
          borderRadius: '50%', 
          width: '32px', 
          height: '32px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          cursor: 'pointer',
          zIndex: 3,
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}
      >
        <span className="material-symbols-outlined" style={{ 
          fontSize: '1.2rem', 
          color: isInWishlist(product.id) ? 'var(--danger)' : '#666',
          fontVariationSettings: isInWishlist(product.id) ? "'FILL' 1" : "'FILL' 0"
        }}>
          {isInWishlist(product.id) ? 'favorite' : 'favorite'}
        </span>
      </button>

      {/* Image Section */}
      <Link to={`/product/${product.id}`} className="product-card-image-wrapper" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ position: 'relative', paddingBottom: '100%', overflow: 'hidden', background: '#fff' }}>
          <img 
            src={product.image} 
            alt={product.name} 
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%', 
              height: '100%', 
              objectFit: 'contain',
              padding: '10px'
            }} 
          />
        </div>
      </Link>

      {/* Content Section */}
      <div className="product-card-content" style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: '0.75rem', color: '#999', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '600' }}>
          {product.category}
        </div>
        <h3 style={{ 
          fontSize: '0.95rem', 
          fontWeight: '600', 
          marginBottom: '8px', 
          height: '2.4em', 
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          color: '#333',
          lineHeight: '1.2'
        }}>
          <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>{product.name}</Link>
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#111' }}>₹{displayPrice}</span>
          {hasDiscount && (
            <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.85rem' }}>₹{product.mrp}</span>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ 
            background: '#22c55e', 
            color: '#fff', 
            padding: '2px 6px', 
            borderRadius: '4px', 
            fontSize: '0.75rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '2px',
            fontWeight: 'bold'
          }}>
            {product.rating || '4.2'} <span className="material-symbols-outlined" style={{ fontSize: '0.8rem' }}>star</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#777' }}>{product.weight}g</span>
        </div>

        {/* Action Buttons */}
        <div className="product-card-actions" style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            onClick={handleAddToCart}
            disabled={(product.stock || 0) <= 0}
            style={{ 
              width: '100%', 
              padding: '8px', 
              borderRadius: '6px', 
              border: '1px solid var(--primary)', 
              background: '#fff', 
              color: 'var(--primary)', 
              fontSize: '0.85rem', 
              fontWeight: '600', 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Add to Cart
          </button>
          <button 
            onClick={handleBuyNow}
            disabled={(product.stock || 0) <= 0}
            style={{ 
              width: '100%', 
              padding: '8px', 
              borderRadius: '6px', 
              border: 'none', 
              background: (product.stock || 0) <= 0 ? '#ccc' : 'var(--primary)', 
              color: '#fff', 
              fontSize: '0.85rem', 
              fontWeight: '600', 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
