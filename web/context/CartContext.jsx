import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient } from '../lib/api';
import { getStoredToken } from '../lib/auth';

const CartContext = createContext(null);

const emptyWallet = { balance: 0, history: [] };

const mergeCartItem = (items, nextItem) => {
  const existingIndex = items.findIndex((item) => item.product?._id === nextItem.product?._id);

  if (existingIndex === -1) {
    return [...items, nextItem];
  }

  const updated = [...items];
  updated[existingIndex] = nextItem;
  return updated;
};

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [wallet, setWallet] = useState(emptyWallet);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawer] = useState(false);

  const resetSessionData = () => {
    setItems([]);
    setFavorites([]);
    setWallet(emptyWallet);
    setDrawer(false);
  };

  const fetchCart = async () => {
    if (!getStoredToken()) {
      setItems([]);
      return [];
    }

    const response = await apiClient.get('/cart');
    const nextItems = Array.isArray(response.data?.items) ? response.data.items : [];
    setItems(nextItems);
    return nextItems;
  };

  const fetchFavorites = async () => {
    if (!getStoredToken()) {
      setFavorites([]);
      return [];
    }

    const response = await apiClient.get('/favorites');
    const nextFavorites = Array.isArray(response.data?.favorites) ? response.data.favorites : [];
    setFavorites(nextFavorites);
    return nextFavorites;
  };

  const fetchWallet = async () => {
    if (!getStoredToken()) {
      setWallet(emptyWallet);
      return emptyWallet;
    }

    const response = await apiClient.get('/wallet');
    const nextWallet = {
      balance: response.data?.balance || 0,
      history: Array.isArray(response.data?.history) ? response.data.history : [],
    };
    setWallet(nextWallet);
    return nextWallet;
  };

  const refreshAll = async () => {
    if (!getStoredToken()) {
      resetSessionData();
      return;
    }

    setLoading(true);
    try {
      await Promise.allSettled([fetchCart(), fetchFavorites(), fetchWallet()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();

    const handleAuthChange = () => {
      refreshAll();
    };

    window.addEventListener('govigi-auth-changed', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('govigi-auth-changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const addItem = async (productId, quantity = 1) => {
    if (!getStoredToken()) {
      return { requiresAuth: true };
    }

    const response = await apiClient.post('/cart', { productId, quantity });
    const nextItem = response.data?.item;
    if (nextItem) {
      setItems((current) => mergeCartItem(current, nextItem));
    }
    return response.data;
  };

  const updateQty = async (productId, quantity) => {
    if (!getStoredToken()) {
      return { requiresAuth: true };
    }

    if (quantity < 1) {
      return removeItem(productId);
    }

    const response = await apiClient.put(`/cart/${productId}`, { quantity });
    const nextItem = response.data?.item;
    if (nextItem) {
      setItems((current) => mergeCartItem(current, nextItem));
    }
    return response.data;
  };

  const removeItem = async (productId) => {
    if (!getStoredToken()) {
      return { requiresAuth: true };
    }

    await apiClient.delete(`/cart/${productId}`);
    setItems((current) => current.filter((item) => item.product?._id !== productId));
    return { success: true };
  };

  const clearCart = async () => {
    if (!getStoredToken()) {
      setItems([]);
      return { success: true };
    }

    await apiClient.delete('/cart');
    setItems([]);
    return { success: true };
  };

  const toggleFavorite = async (product) => {
    if (!getStoredToken()) {
      return { requiresAuth: true };
    }

    const isFavorite = favorites.some((favorite) => favorite?._id === product._id);

    setFavorites((current) =>
      isFavorite
        ? current.filter((favorite) => favorite?._id !== product._id)
        : [...current, product]
    );

    try {
      const response = await apiClient.post('/favorites/toggle', { productId: product._id });
      return response.data;
    } catch (error) {
      setFavorites((current) =>
        isFavorite
          ? [...current, product]
          : current.filter((favorite) => favorite?._id !== product._id)
      );
      throw error;
    }
  };

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0),
    [items]
  );
  const deliveryFee = subtotal === 0 || subtotal >= 500 ? 0 : 30;
  const total = subtotal + deliveryFee;
  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const favoriteIds = useMemo(() => favorites.map((favorite) => favorite?._id).filter(Boolean), [favorites]);

  const value = {
    items,
    favorites,
    favoriteIds,
    wallet,
    loading,
    drawerOpen,
    setDrawer,
    subtotal,
    deliveryFee,
    total,
    count,
    fetchCart,
    fetchFavorites,
    fetchWallet,
    refreshAll,
    addItem,
    updateQty,
    removeItem,
    clearCart,
    toggleFavorite,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider.');
  }

  return context;
};
