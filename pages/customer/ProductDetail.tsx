import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { user, loginWithGoogle } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as Product;
          setProduct({ id: docSnap.id, ...data });
          setSelectedImage(data.image);

          // Fetch Related Products (People Also Viewed)
          let relatedQuery;
          if (data.keywords && data.keywords.length > 0) {
            // Use first 10 keywords max due to Firestore limit
            const searchKeywords = data.keywords.slice(0, 10);
            relatedQuery = query(
              collection(db, 'products'),
              where('keywords', 'array-contains-any', searchKeywords),
              limit(5)
            );
          } else {
            // Fallback to Category
            relatedQuery = query(
              collection(db, 'products'),
              where('category', '==', data.category),
              limit(5)
            );
          }

          const relatedSnap = await getDocs(relatedQuery);
          const relatedList = relatedSnap.docs
            .map(d => ({ id: d.id, ...(d.data() as any) } as Product))
            .filter(p => p.id !== docSnap.id); // Exclude current product

          setRelatedProducts(relatedList);

        } else {
          console.error("No such product!");
          setProduct(null);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Determine Effective Price
  const getEffectivePrice = () => {
    if (!product) return 0;
    const today = new Date().toISOString().split('T')[0];
    if (product.offerStartDate && product.offerEndDate && product.salePrice && product.salePrice > 0) {
      if (today >= product.offerStartDate && today <= product.offerEndDate) {
        return product.salePrice;
      }
    }
    return product.price;
  };

  const effectivePrice = getEffectivePrice();
  const isOfferActive = effectivePrice < (product?.mrp || product?.price || 0) && effectivePrice === product?.salePrice;


  const handleAddToCart = async () => {
    if (!product) return;

    if (!user) {
      showToast("Please login with Google to continue shopping", 'error');
      try {
        await loginWithGoogle();
      } catch (error) {
        console.error("Login failed", error);
        showToast("Login failed. Please try again.", 'error');
      }
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: effectivePrice,
      image: product.image,
      weight: product.weight
    }, quantity);
    showToast(`Added ${quantity} ${product.name} to cart!`, 'success');
  };

  if (loading) return <div className="container" style={{ padding: '4rem' }}>Loading...</div>;

  if (!product) {
    return (
      <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
        <h2>Product not found</h2>
        <Link to="/shop" className="btn btn-primary">Back to Shop</Link>
      </div>
    );
  }

  // showToast(`${product.name} added to cart!`, 'success'); // This logic was seemingly misplaced or redundant if handled in handleAddToCart

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      {/* Breadcrumbs */}
      <div style={{ marginBottom: '2rem', color: '#666', fontSize: '0.9rem' }}>
        <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / <span style={{ color: '#333' }}>{product.category}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>

        {/* Product Image */}
        {/* Left Column: Gallery + Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>

          <div style={{ display: 'flex', gap: '1rem', height: '450px', marginBottom: '2rem' }}>
            {/* Vertical Thumbnails */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              overflowY: 'auto',
              width: '70px',
              flexShrink: 0,
              paddingRight: '5px'
            }} className="no-scrollbar">
              {/* Combine main image (if not in images array) + images array for the full list. 
                      However, to simplify based on user constraint: just show all available images unique. */}
              {[product.image, ...(product.images || [])]
                .filter((item, index, self) => self.indexOf(item) === index && item) // Unique & Truthy
                .slice(0, 5) // Max 5 limit display
                .map((img, idx) => (
                  <div
                    key={idx}
                    onMouseEnter={() => setSelectedImage(img)} // Hover usually better for desktop, click for mobile
                    onClick={() => setSelectedImage(img)}
                    style={{
                      width: '60px',
                      height: '60px',
                      border: `2px solid ${selectedImage === img ? '#d946ef' : '#e5e7eb'}`, // Pinkish border for selected
                      borderRadius: '4px',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      opacity: selectedImage === img ? 1 : 0.7,
                      transition: 'all 0.2s'
                    }}
                  >
                    <img src={img} alt={`Thumb ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                ))}
            </div>

            {/* Main Image Area */}
            <div style={{
              flex: 1,
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <img
                src={selectedImage || product.image}
                alt={product.name}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', transition: 'transform 0.3s' }}
              />
              {isOfferActive && (
                <span style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'var(--danger)',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  {Math.round(((product.mrp! - effectivePrice) / product.mrp!) * 100)}% OFF
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <button
              onClick={handleAddToCart}
              disabled={(product.stock || 0) <= 0}
              className="btn"
              style={{
                background: '#fff',
                color: '#000',
                border: '1px solid #000',
                padding: '1rem',
                fontWeight: 'bold',
                fontSize: '1rem',
                borderRadius: '4px',
                textTransform: 'uppercase',
                opacity: (product.stock || 0) <= 0 ? 0.5 : 1,
                cursor: (product.stock || 0) <= 0 ? 'not-allowed' : 'pointer'
              }}
            >
              Add to Cart
            </button>
            <button
              onClick={async () => {
                if ((product.stock || 0) <= 0) return;
                if (!user) {
                  showToast("Please login to proceed to checkout", 'error');
                  try {
                    await loginWithGoogle();
                  } catch (e) {
                    console.error(e);
                  }
                  return;
                }
                addToCart({
                  id: product.id,
                  name: product.name,
                  price: effectivePrice,
                  image: product.image,
                  weight: product.weight
                }, quantity);
                navigate('/checkout');
              }}
              disabled={(product.stock || 0) <= 0}
              className="btn"
              style={{
                background: '#9f2089', // Meesho-like purple/pink
                color: '#fff',
                border: 'none',
                padding: '1rem',
                fontWeight: 'bold',
                fontSize: '1rem',
                borderRadius: '4px',
                textTransform: 'uppercase',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                opacity: (product.stock || 0) <= 0 ? 0.5 : 1,
                cursor: (product.stock || 0) <= 0 ? 'not-allowed' : 'pointer'
              }}
            >
              Buy Now
            </button>
          </div>

        </div>

        {/* Product Info */}
        <div>
          <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--success)', background: '#ECFDF5', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
            100% Vegetarian
          </span>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '1rem 0 0.5rem' }}>{product.name}</h1>
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>⭐⭐⭐⭐⭐ (156 Reviews)</p>

          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
            {isOfferActive && product.mrp ? (
              <>
                <span style={{ fontSize: '2.5rem', color: 'var(--primary)' }}>₹{effectivePrice}</span>
                <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '1.2rem', marginLeft: '1rem' }}>MRP ₹{product.mrp}</span>
                <span style={{ fontSize: '1rem', background: 'var(--danger)', color: 'white', padding: '2px 8px', borderRadius: '4px', marginLeft: '1rem', verticalAlign: 'middle' }}>
                  {Math.round(((product.mrp - effectivePrice) / product.mrp) * 100)}% OFF
                </span>
              </>
            ) : product.mrp && product.mrp > product.price ? (
              <>
                <span style={{ fontSize: '2.5rem', color: 'var(--text-dark)' }}>₹{product.price}</span>
                <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '1.2rem', marginLeft: '1rem' }}>MRP ₹{product.mrp}</span>
              </>
            ) : (
              <span>₹{product.price}</span>
            )}
            <span style={{ fontSize: '1.2rem', color: '#999', fontWeight: 'normal', marginLeft: '0.5rem' }}>/ {product.weight}g</span>
          </div>
          {isOfferActive && (
            <div style={{ marginBottom: '1rem', color: 'var(--danger)', fontWeight: 'bold' }}>
              Generic Offer Valid from {product.offerStartDate} to {product.offerEndDate}
            </div>
          )}
          <div style={{ color: 'var(--success)', fontSize: '0.9rem', marginBottom: '2rem' }}>Inclusive of all taxes</div>

          <p style={{ color: '#555', lineHeight: '1.6', marginBottom: '2rem' }}>
            {product.description}
          </p>

          {/* Stock Status */}
          <div style={{ marginBottom: '1.5rem' }}>
            {(product.stock || 0) <= 0 ? (
              <span style={{ color: 'red', fontWeight: 'bold', fontSize: '1.2rem', padding: '0.5rem 1rem', background: '#ffebee', borderRadius: '4px' }}>
                Out of Stock
              </span>
            ) : (
              <span style={{ color: 'green', fontWeight: 'bold' }}>
                In Stock: {(product.stock || 0) < 10 ? <span style={{ color: '#eab308' }}>Only {product.stock} left!</span> : product.stock}
              </span>
            )}
          </div>

          {/* Quantity Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px', opacity: (product.stock || 0) <= 0 ? 0.5 : 1 }}>
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={(product.stock || 0) <= 0}
                style={{ padding: '0.6rem 1rem', background: 'none', border: 'none', cursor: (product.stock || 0) <= 0 ? 'not-allowed' : 'pointer', fontSize: '1.2rem' }}
              >
                -
              </button>
              <span style={{ padding: '0.6rem 1rem', minWidth: '40px', textAlign: 'center', fontWeight: 'bold' }}>{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min((product.stock || 0), q + 1))}
                disabled={(product.stock || 0) <= 0 || quantity >= (product.stock || 0)}
                style={{ padding: '0.6rem 1rem', background: 'none', border: 'none', cursor: (product.stock || 0) <= 0 || quantity >= (product.stock || 0) ? 'not-allowed' : 'pointer', fontSize: '1.2rem' }}
              >
                +
              </button>
            </div>
            {(product.stock || 0) > 0 && quantity >= (product.stock || 0) && <span style={{ color: 'red', fontSize: '0.8rem' }}>Max quantity reached</span>}
          </div>


          {/* Trust Badges */}
          <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', color: '#666', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🌿</span> Natural Ingredients
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🛡️</span> Authentic Brand
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🚚</span> Secure Delivery
            </div>
          </div>

        </div>
      </div>

      {/* People Also Viewed Section */}
      {relatedProducts.length > 0 && (
        <div style={{ marginTop: '4rem', borderTop: '1px solid #eee', paddingTop: '3rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '2rem' }}>People Also Viewed</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '2rem' }}>
            {relatedProducts.map(rp => (
              <Link to={`/product/${rp.id}`} key={rp.id} onClick={() => window.scrollTo(0, 0)} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden', transition: 'transform 0.2s', background: '#fff' }} className="related-card">
                  <div style={{ height: '200px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={rp.image} alt={rp.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: '600' }}>{rp.name}</h4>
                    <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>₹{rp.salePrice || rp.price}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;