import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, where, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Product, Brand } from '../../types';

import BestOfferPopup from '../../components/BestOfferPopup';
import ProductCard from '../../components/ProductCard';

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [topOffers, setTopOffers] = useState<Product[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  const [categories, setCategories] = useState<{ id: string, name: string, image: string }[]>([]);
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('Recommended');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Categories
        const categoriesSnap = await getDocs(collection(db, 'categories'));
        const categoriesList = categoriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        
        // Helper to check for invisible characters (like U+3164)
        const isInvalid = (str: string) => !str || str.trim().length === 0 || str.includes('ㅤ');

        // Pre-process categories from collection to handle invalid names
        const categoriesFromDB = categoriesSnap.docs.map(doc => {
          const data = doc.data();
          const cleanName = isInvalid(data.name) ? doc.id : data.name;
          return {
            id: doc.id,
            name: cleanName,
            image: data.image
          };
        });
        
        // Fetch Featured Products for the section
        const qFeatured = query(collection(db, 'products'), where('featured', '==', true), limit(20));
        const featuredSnap = await getDocs(qFeatured);
        const featuredList = featuredSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
        setFeaturedProducts(featuredList);
        setDisplayProducts(featuredList);

        // Fetch Brands
        const brandsSnap = await getDocs(collection(db, 'brands'));
        const brandsList = brandsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Brand[];
        setBrands(brandsList);

        // Fetch All Products for Offers and to derive valid Categories
        const allProductsSnap = await getDocs(collection(db, 'products'));
        const allProducts = allProductsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];

        // Derive unique categories from products (these are usually correct strings)
        const productCategories = [...new Set(allProducts.map(p => p.category).filter(c => !isInvalid(c)))];
        
        // Build final categories list by matching product categories to DB documents
        const finalCategories = productCategories.map(catName => {
          // Match by name or ID (case-insensitive)
          const matched = categoriesFromDB.find(c => 
            c.name.toLowerCase() === catName.toLowerCase() || 
            c.id.toLowerCase() === catName.toLowerCase()
          );
          
          return {
            id: matched?.id || catName,
            name: catName,
            image: matched?.image || 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=200&auto=format&fit=crop'
          };
        });

        // Also include any categories from the DB that weren't in products but have valid names
        categoriesFromDB.forEach(c => {
          if (!productCategories.some(pc => pc.toLowerCase() === c.name.toLowerCase())) {
            finalCategories.push(c);
          }
        });

        setCategories(finalCategories);

        const today = new Date().toISOString().split('T')[0];
        const activeOffers = allProducts.filter(p => {
          if (p.offerStartDate && p.offerEndDate && p.mrp && p.salePrice) {
            return today >= p.offerStartDate && today <= p.offerEndDate;
          }
          return false;
        });

        // Calculate discounts and sort desc
        activeOffers.sort((a, b) => {
          const discountA = ((a.mrp! - a.salePrice!) / a.mrp!) * 100;
          const discountB = ((b.mrp! - b.salePrice!) / b.mrp!) * 100;
          return discountB - discountA;
        });

        setTopOffers(activeOffers.slice(0, 10));

        // Show popup logic
        if (activeOffers.length > 0) {
          const hasSeenPopup = sessionStorage.getItem('hasSeenBestOfferPopup');
          if (!hasSeenPopup) {
            setShowPopup(true);
            sessionStorage.setItem('hasSeenBestOfferPopup', 'true');
          }
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Combined Filter and Sort Logic
  useEffect(() => {
    const applyFiltersAndSort = async () => {
      let filtered: Product[] = [];
      
      if (selectedCategory === 'All') {
        filtered = [...featuredProducts];
      } else {
        try {
          const q = query(collection(db, 'products'), where('category', '==', selectedCategory), limit(20));
          const snap = await getDocs(q);
          filtered = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
        } catch (error) {
          console.error("Error filtering products:", error);
          filtered = [];
        }
      }

      // Apply Sorting
      const sorted = [...filtered];
      if (sortOption === 'Price: Low to High') {
        sorted.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
      } else if (sortOption === 'Price: High to Low') {
        sorted.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
      } else if (sortOption === 'Recommended') {
        // No sorting needed, already in default order
      }

      setDisplayProducts(sorted);
    };

    if (featuredProducts.length > 0 || selectedCategory !== 'All') {
      applyFiltersAndSort();
    }
  }, [selectedCategory, sortOption, featuredProducts]);

  // Auto-slide effect
  useEffect(() => {
    if (topOffers.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % topOffers.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [topOffers.length]);

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % topOffers.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + topOffers.length) % topOffers.length);

  // const categories = [
  //   { name: 'Chips', image: 'https://images.unsplash.com/photo-1566478919030-26d9c28642dd?q=80&w=300&auto=format&fit=crop' },
  //   { name: 'Sweets', image: 'https://images.unsplash.com/photo-1599785209796-786432b228bc?q=80&w=300&auto=format&fit=crop' },
  //   { name: 'Nuts', image: 'https://images.unsplash.com/photo-1536591375315-196000ea3677?q=80&w=300&auto=format&fit=crop' },
  //   { name: 'Spices', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=300&auto=format&fit=crop' },
  // ];

  return (
    <div className="home-container">
      {/* Best Offer Popup */}
      {showPopup && topOffers.length > 0 && (
        <BestOfferPopup
          offer={topOffers[0]}
          onClose={() => setShowPopup(false)}
        />
      )}

      {/* Hero Section - Hidden on Mobile */}
      <section className="hero-section hidden-mobile" style={{ position: 'relative', overflow: 'hidden', height: '320px', background: '#222' }}>
        {topOffers.length > 0 ? (
          <>
            {topOffers.map((offer, index) => (
              <div
                key={offer.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: index === currentSlide ? 1 : 0,
                  transition: 'opacity 1s ease-in-out',
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.8)), url(${offer.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  zIndex: index === currentSlide ? 2 : 1
                }}
              >
                <div className="container hero-content" style={{ textAlign: 'center', maxWidth: '800px', padding: '0.5rem', animation: index === currentSlide ? 'fadeInUp 1s ease' : 'none' }}>
                  <style>{`
                                @keyframes fadeInUp {
                                    from { opacity: 0; transform: translateY(20px); }
                                    to { opacity: 1; transform: translateY(0); }
                                }
                             `}</style>
                  <span className="badge-new" style={{ alignSelf: 'center', background: 'var(--danger)', marginBottom: '0.2rem', fontSize: '0.7rem' }}>
                    LIMITED TIME DEAL
                  </span>
                  <h1 className="hero-title" style={{ fontSize: '2rem', marginBottom: '0', textShadow: '0 2px 4px rgba(0,0,0,0.5)', lineHeight: '1.2' }}>
                    {Math.round(((offer.mrp! - offer.salePrice!) / offer.mrp!) * 100)}% OFF
                  </h1>
                  <h2 style={{ fontSize: '1.2rem', marginBottom: '0.3rem', fontWeight: '300' }}>
                    on {offer.name}
                  </h2>
                  <p className="hero-subtitle" style={{ fontSize: '0.9rem', marginBottom: '0.8rem', opacity: 0.9 }}>
                    Get it now for just <span style={{ fontWeight: 'bold', color: '#ffeb3b' }}>₹{offer.salePrice}</span> <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>₹{offer.mrp}</span>.
                    <br /> Offer valid until {offer.offerEndDate}.
                  </p>
                  <Link to={`/product/${offer.id}`} className="btn hero-btn" style={{
                    fontSize: '0.9rem',
                    padding: '0.5rem 1.5rem',
                    background: 'linear-gradient(90deg, var(--primary) 0%, var(--primary-dark) 100%)',
                    color: 'white',
                    borderRadius: '50px',
                    boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)',
                    transform: 'translateY(0)',
                    transition: 'all 0.3s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontWeight: 'bold',
                    border: 'none',
                    display: 'inline-block'
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(37, 99, 235, 0.4)';
                    }}
                  >
                    Grab Deal Now &rarr;
                  </Link>
                </div>
              </div>
            ))}

            {/* Navigation Arrows */}
            {topOffers.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  style={{ position: 'absolute', top: '50%', left: '20px', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '1rem', cursor: 'pointer', zIndex: 10, borderRadius: '50%' }}
                >
                  &#10094;
                </button>
                <button
                  onClick={nextSlide}
                  style={{ position: 'absolute', top: '50%', right: '20px', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '1rem', cursor: 'pointer', zIndex: 10, borderRadius: '50%' }}
                >
                  &#10095;
                </button>

                {/* Indicators */}
                <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px', zIndex: 10 }}>
                  {topOffers.map((_, idx) => (
                    <div
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: idx === currentSlide ? 'var(--primary)' : 'rgba(255,255,255,0.5)',
                        cursor: 'pointer',
                        transition: 'background 0.3s'
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          // Default Hero if no offers
          <div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(https://placehold.co/1200x400/222/fff?text=Authentic+Flavors)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <div className="container hero-content" style={{ textAlign: 'center' }}>
              <span className="badge-new" style={{ alignSelf: 'center' }}>NEW ARRIVALS</span>
              <h1 className="hero-title">
                Authentic Flavors, Delivered Fresh.
              </h1>
              <p className="hero-subtitle">
                Explore India's finest collection of spicy namkeens, sweet delicacies, and refreshing beverages.
              </p>
              <Link to="/shop" className="btn btn-primary hero-btn">
                Shop Now
              </Link>
            </div>
          </div>
        )}
      </section>


      {/* Categories - Mobile Horizontal Scroll / Desktop Grid */}
      <section className="container" style={{ padding: '1rem 1rem' }}>
        <div className="visible-mobile">
          <div className="horizontal-scroll">
            <Link to="/categories" className="category-circle-item">
              <div className="category-circle-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff0f0' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '2rem' }}>apps</span>
              </div>
              <div className="category-circle-name">Categories</div>
            </Link>
            {categories.map((cat) => (
              <Link to={`/shop?cat=${cat.name}`} key={cat.id} className="category-circle-item">
                <img src={cat.image} alt={cat.name} className="category-circle-img" />
                <div className="category-circle-name">{cat.name}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden-mobile">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Shop by Category</h2>
            <Link to="/shop" style={{ color: 'var(--primary)', fontWeight: '600' }}>View All &rarr;</Link>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <Link to={`/shop?cat=${cat.name}`} key={cat.id} style={{ textAlign: 'center', group: 'hover' }}>
                <div style={{
                  width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden',
                  marginBottom: '1rem', border: '2px solid transparent', transition: 'all 0.3s',
                  boxShadow: 'var(--shadow)'
                }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                >
                  <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h3 style={{ fontWeight: '600' }}>{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products / All Products */}
      <section style={{ background: '#f8f9fa', padding: '1rem 0 4rem 0' }}>
        <div className="container">
          <div className="visible-mobile">
            <h2 className="section-title">Products For You</h2>
            {/* Mobile Filter Tabs */}
            <div className="mobile-filter-tabs">
              <div className="filter-tab-item" onClick={() => setShowSortMenu(true)}>
                <span className="material-symbols-outlined">swap_vert</span> Sort
              </div>
              <div className="filter-tab-item" onClick={() => setShowCategoryMenu(true)}>
                Category <span className="material-symbols-outlined">expand_more</span>
              </div>
              <div className="filter-tab-item" onClick={() => navigate('/shop')}>
                <span className="material-symbols-outlined">filter_list</span> Filters
              </div>
            </div>

            {/* Sort Overlay */}
            {showSortMenu && (
              <div className="mobile-overlay" onClick={() => setShowSortMenu(false)}>
                <div className="mobile-menu-bottom" onClick={e => e.stopPropagation()}>
                  <div className="menu-header">Sort By</div>
                  <div className="menu-options">
                    {['Recommended', 'Price: Low to High', 'Price: High to Low'].map(opt => (
                      <div 
                        key={opt} 
                        className={`menu-option-item ${sortOption === opt ? 'active' : ''}`}
                        onClick={() => { setSortOption(opt); setShowSortMenu(false); }}
                      >
                        {opt}
                        {sortOption === opt && <span className="material-symbols-outlined">check</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Category Overlay */}
            {showCategoryMenu && (
              <div className="mobile-overlay" onClick={() => setShowCategoryMenu(false)}>
                <div className="mobile-menu-bottom" onClick={e => e.stopPropagation()}>
                  <div className="menu-header">Select Category</div>
                  <div className="menu-options" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    <div 
                      className={`menu-option-item ${selectedCategory === 'All' ? 'active' : ''}`}
                      onClick={() => { setSelectedCategory('All'); setShowCategoryMenu(false); }}
                    >
                      All Categories
                    </div>
                    {categories.map(cat => (
                      <div 
                        key={cat.id} 
                        className={`menu-option-item ${selectedCategory === cat.name ? 'active' : ''}`}
                        onClick={() => { setSelectedCategory(cat.name); setShowCategoryMenu(false); }}
                      >
                        {cat.name}
                        {selectedCategory === cat.name && <span className="material-symbols-outlined">check</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="hidden-mobile">
            <div className="desktop-filter-bar">
              <div className="filter-group">
                <h2 className="section-title" style={{ margin: 0, marginRight: '1rem' }}>Products For You</h2>
                <div 
                  className={`filter-pill ${selectedCategory === 'All' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('All')}
                >
                  All
                </div>
                {categories.slice(0, 5).map(cat => (
                  <div 
                    key={cat.id}
                    className={`filter-pill ${(selectedCategory === cat.name || selectedCategory === cat.id) ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.name || cat.id)}
                  >
                    {cat.name || cat.id}
                  </div>
                ))}
                {categories.length > 5 && (
                  <Link to="/categories" className="filter-pill">More &hellip;</Link>
                )}
              </div>
              
              <div className="sort-select-wrapper">
                <span style={{ fontSize: '0.9rem', color: '#666' }}>Sort By:</span>
                <select 
                  className="sort-select"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="Recommended">Recommended</option>
                  <option value="Price: Low to High">Price: Low to High</option>
                  <option value="Price: High to Low">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid-products">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Brands */}
      {brands.length > 0 && (
        <section style={{ padding: '4rem 0', background: '#fff' }}>
          <div className="container">
            <h2 className="section-title">Our Brands</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem', alignItems: 'center' }}>
              {brands.map(brand => (
                <Link to={`/shop?brand=${brand.name}`} key={brand.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textAlign: 'center', minWidth: '100px' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '1px solid #eee', overflow: 'hidden', padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {brand.logo ? (
                      <img src={brand.logo} alt={brand.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontSize: '2rem', color: '#ccc' }}>🏭</span>
                    )}
                  </div>
                  <span style={{ fontWeight: '600', color: '#555', fontSize: '0.9rem' }}>{brand.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section style={{ background: 'var(--primary)', padding: '4rem 0', color: '#fff', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Get 15% off your first order</h2>
          <p style={{ marginBottom: '2rem', opacity: 0.9 }}>Subscribe to our newsletter for exclusive offers and new arrivals.</p>
          <div style={{ maxWidth: '500px', margin: '0 auto', display: 'flex', gap: '1rem' }}>
            <input type="email" placeholder="Enter your email" style={{ flex: 1, border: 'none' }} />
            <button className="btn" style={{ background: '#000', color: '#fff' }}>Subscribe</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;