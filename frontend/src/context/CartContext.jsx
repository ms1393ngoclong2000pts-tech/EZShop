import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const cartKey = user ? `cart_${user.id}` : 'cart_guest';

  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(cartKey) || '[]');
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, cartKey]);

  const addToCart = (product, quantity = 1) => {
    const stockLimit = Number(product.stock || 0);
    if (stockLimit <= 0) return;

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      const nextQuantity = Math.min((existingItem?.quantity || 0) + quantity, stockLimit);

      if (existingItem && nextQuantity < existingItem.quantity + quantity) {
        alert(`Rất tiếc, sản phẩm này chỉ còn ${stockLimit} sản phẩm trong kho.`);
      }

      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: nextQuantity } : item
        );
      }

      return [...prevCart, { product, quantity: Math.min(quantity, stockLimit) }];
    });

    setIsCartOpen(true);
  };

  const updateQty = (productId, newQty, stockLimit) => {
    const limit = Number(stockLimit || 0);
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    if (newQty > limit) {
      alert(`Rất tiếc, sản phẩm này chỉ còn ${limit} sản phẩm trong kho.`);
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity: Math.min(newQty, limit) } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => setCart([]);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce(
    (total, item) => total + item.quantity * Number(item.product.price || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{ cart, isCartOpen, setIsCartOpen, addToCart, updateQty, removeFromCart, clearCart, cartCount, cartTotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
