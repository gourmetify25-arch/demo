import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalWeight: number; // in grams
  chargeableWeight: number; // in kg
  shippingCost: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  /* eslint-disable @typescript-eslint/ban-ts-comment */
  const addToCart = (product: Product, quantity = 1) => {
    // @ts-ignore
    const availableStock = product.stock !== undefined ? product.stock : Infinity;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        if (existing.quantity + quantity > availableStock) {
          alert(`Sorry, only ${availableStock} items available in stock`);
          return prev;
        }

        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }

      if (quantity > availableStock) {
        alert(`Sorry, only ${availableStock} items available in stock`);
        return prev;
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;

    setCart((prev) => {
      const item = prev.find(i => i.id === productId);
      if (!item) return prev;

      // @ts-ignore
      const availableStock = item.stock !== undefined ? item.stock : Infinity;

      if (quantity > availableStock) {
        alert(`Sorry, only ${availableStock} items available in stock`);
        return prev;
      }

      return prev.map((item) => (item.id === productId ? { ...item, quantity } : item));
    });
  };

  const clearCart = () => setCart([]);

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const totalWeight = cart.reduce((sum, item) => sum + item.weight * item.quantity, 0);

  // Chargeable weight: Round up to nearest KG
  // Example: 1500g -> 1.5kg -> ceil(1.5) = 2kg
  const chargeableWeight = Math.ceil(totalWeight / 1000);

  // Shipping = ₹40 per chargeable kg
  // Free Shipping on orders above ₹1099
  const shippingCost = subtotal > 1099 ? 0 : (chargeableWeight * 40);

  const total = subtotal + shippingCost;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        totalWeight,
        chargeableWeight,
        shippingCost,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};