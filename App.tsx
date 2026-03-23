import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';

// Layouts
import CustomerLayout from './components/CustomerLayout';
import AdminLayout from './components/AdminLayout';

// Customer Pages
import Home from './pages/customer/Home';
import Shop from './pages/customer/Shop';
import ProductDetail from './pages/customer/ProductDetail';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import OrderConfirmation from './pages/customer/OrderConfirmation';
import MyOrders from './pages/customer/MyOrders';
import Contact from './pages/customer/Contact';
import About from './pages/customer/About';
import FAQ from './pages/customer/FAQ';
import Terms from './pages/customer/Terms';
import Privacy from './pages/customer/Privacy';
import CategoriesPage from './pages/customer/Categories';
import Wishlist from './pages/customer/Wishlist';

// Admin Pages
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Orders from './pages/admin/Orders';
import OrderDetail from './pages/admin/OrderDetail';
import ProductForm from './pages/admin/ProductForm';
import Migrate from './pages/admin/Migrate';
import Brands from './pages/admin/Brands';
import BrandForm from './pages/admin/BrandForm';
import Keywords from './pages/admin/Keywords';
import Categories from './pages/admin/Categories';
import CategoryForm from './pages/admin/CategoryForm';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <ToastProvider>
            <BrowserRouter>
            <Routes>
              {/* Customer Routes */}
              <Route path="/" element={<CustomerLayout />}>
                <Route index element={<Home />} />
                <Route path="shop" element={<Shop />} />
                <Route path="product/:id" element={<ProductDetail />} />
                <Route path="cart" element={<Cart />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="order-confirmation" element={<OrderConfirmation />} />
                <Route path="my-orders" element={<MyOrders />} />
                <Route path="contact" element={<Contact />} />
                <Route path="about" element={<About />} />
                <Route path="faq" element={<FAQ />} />
                <Route path="terms" element={<Terms />} />
                <Route path="privacy" element={<Privacy />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="wishlist" element={<Wishlist />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="products" element={<Products />} />
                <Route path="products/new" element={<ProductForm />} />
                <Route path="products/:id" element={<ProductForm />} />
                <Route path="orders" element={<Orders />} />
                <Route path="orders/:id" element={<OrderDetail />} />
                <Route path="brands" element={<Brands />} />
                <Route path="brands/new" element={<BrandForm />} />
                <Route path="brands/:id" element={<BrandForm />} />
                <Route path="keywords" element={<Keywords />} />
                <Route path="categories" element={<Categories />} />
                <Route path="categories/new" element={<CategoryForm />} />
                <Route path="categories/:id" element={<CategoryForm />} />
                <Route path="migrate" element={<Migrate />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </CartProvider>
    </WishlistProvider>
  </AuthProvider>
  );
};


export default App;