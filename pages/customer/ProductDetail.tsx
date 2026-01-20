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

          <div className="product-gallery" style={{ display: 'flex', gap: '1rem', height: '500px', marginBottom: '2rem' }}>
            {/* Thumbnail List */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              overflowY: 'auto',
              width: '80px',
              flexShrink: 0,
              paddingRight: '4px'
            }} className="no-scrollbar">
              {[product.image, ...(product.images || [])]
                .filter((item, index, self) => self.indexOf(item) === index && item)
                .slice(0, 5)
                .map((img, idx) => (
                  <div
                    key={idx}
                    onMouseEnter={() => setSelectedImage(img)}
                    onClick={() => setSelectedImage(img)}
                    style={{
                      width: '70px',
                      height: '70px',
                      border: `2px solid ${selectedImage === img ? 'var(--primary)' : 'transparent'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      padding: '4px',
                      background: selectedImage === img ? '#fff7ed' : '#f9fafb',
                      transition: 'all 0.2s',
                    }}
                  >
                    <img src={img} alt={`Thumb ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                  </div>
                ))}
            </div>

            {/* Main Image */}
            <div style={{
              flex: 1,
              background: '#f9fafb',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <img
                src={selectedImage || product.image}
                alt={product.name}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}
              />
              {isOfferActive && (
                <span style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  background: 'var(--danger)',
                  color: 'white',
                  padding: '6px 14px',
                  borderRadius: '30px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  boxShadow: '0 4px 6px rgba(220, 38, 38, 0.2)'
                }}>
                  {Math.round(((product.mrp! - effectivePrice) / product.mrp!) * 100)}% OFF
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div style={{ padding: '0 1rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            {product.brand || 'THE CHEESE CO.'}
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0 0 1rem', lineHeight: '1.2', color: '#1f2937' }}>{product.name}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <span style={{ color: '#F59E0B', fontSize: '1.1rem' }}>★★★★☆</span>
            <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>4.8 (124 reviews)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {isOfferActive && product.mrp ? (
              <>
                <span style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)' }}>₹{effectivePrice}</span>
                <span style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: '1.2rem', marginTop: '0.5rem' }}>₹{product.mrp}</span>
                <span style={{ background: '#000', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', height: 'fit-content', marginTop: '0.5rem' }}>
                  {Math.round(((product.mrp - effectivePrice) / product.mrp) * 100)}% OFF
                </span>
              </>
            ) : (
              <span style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1f2937' }}>₹{product.price}</span>
            )}
            <span style={{ color: '#6b7280', fontSize: '1rem' }}>/ {product.weight}g</span>
          </div>

          <p style={{ color: '#4b5563', lineHeight: '1.7', marginBottom: '2rem', fontSize: '1rem' }}>
            {product.description}
          </p>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'stretch', marginBottom: '2rem', flexWrap: 'wrap' }}>
            {/* Quantity */}
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff' }}>
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                style={{ padding: '0 1rem', height: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#374151' }}
              >-</button>
              <span style={{ width: '40px', textAlign: 'center', fontWeight: '600', fontSize: '1.1rem' }}>{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min((product.stock || 0), q + 1))}
                disabled={quantity >= (product.stock || 0)}
                style={{ padding: '0 1rem', height: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#374151' }}
              >+</button>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={(product.stock || 0) <= 0}
              className="btn"
              style={{
                flex: 1,
                background: 'var(--primary)',
                color: '#fff',
                border: 'none',
                padding: '1rem 2rem',
                fontWeight: 'bold',
                fontSize: '1rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 6px rgba(234, 88, 12, 0.3)',
                opacity: (product.stock || 0) <= 0 ? 0.7 : 1,
                cursor: (product.stock || 0) <= 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <span className="material-symbols-outlined">shopping_bag</span>
              {(product.stock || 0) <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>

            {/* Buy Now (Secondary/Checkout) */}
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
              style={{
                background: '#f3f4f6',
                color: '#1f2937',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '0 1.5rem',
                fontWeight: 'bold',
                cursor: (product.stock || 0) <= 0 ? 'not-allowed' : 'pointer',
                opacity: (product.stock || 0) <= 0 ? 0.5 : 1
              }}
            >
              Buy Now
            </button>

            <button style={{ padding: '0 1rem', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ color: '#ef4444' }}>favorite</span>
            </button>
          </div>

          {/* Trust Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '2.5rem' }}>
            <div style={{ background: '#fff', border: '1px solid #f3f4f6', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ background: '#fff7ed', padding: '10px', borderRadius: '50%', color: 'var(--primary)' }}>
                <span className="material-symbols-outlined">verified</span>
              </div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#111' }}>100% Authentic</div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Direct from makers</div>
              </div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #f3f4f6', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ background: '#fff7ed', padding: '10px', borderRadius: '50%', color: 'var(--primary)' }}>
                <span className="material-symbols-outlined">security</span>
              </div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#111' }}>Secure Payment</div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Encrypted transactions</div>
              </div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #f3f4f6', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ background: '#fff7ed', padding: '10px', borderRadius: '50%', color: 'var(--primary)' }}>
                <span className="material-symbols-outlined">local_shipping</span>
              </div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#111' }}>Fast Delivery</div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Available nationwide</div>
              </div>
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