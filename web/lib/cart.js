const CART_KEY = 'foodooza-cart';

const dispatchCartUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('foodooza-cart-updated'));
  }
};

export const getCartItems = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    return JSON.parse(window.localStorage.getItem(CART_KEY) || '[]');
  } catch (_error) {
    return [];
  }
};

export const setCartItems = (items) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(CART_KEY, JSON.stringify(items));
    dispatchCartUpdated();
  }
};

export const clearCart = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(CART_KEY);
    dispatchCartUpdated();
  }
};

export const addCartItem = (nextItem) => {
  const currentItems = getCartItems();
  const existingShopId = currentItems[0]?.shopId;
  const mustReplaceShop = existingShopId && existingShopId !== nextItem.shopId;
  const baseItems = mustReplaceShop ? [] : [...currentItems];
  const matchingIndex = baseItems.findIndex((item) => item.itemId === nextItem.itemId);

  if (matchingIndex >= 0) {
    baseItems[matchingIndex] = {
      ...baseItems[matchingIndex],
      quantity: baseItems[matchingIndex].quantity + nextItem.quantity,
    };
  } else {
    baseItems.push(nextItem);
  }

  setCartItems(baseItems);

  return {
    items: baseItems,
    replacedShop: mustReplaceShop,
  };
};

export const updateCartItemQuantity = (itemId, quantity) => {
  const nextItems = getCartItems()
    .map((item) => (item.itemId === itemId ? { ...item, quantity } : item))
    .filter((item) => item.quantity > 0);

  setCartItems(nextItems);
  return nextItems;
};

export const removeCartItem = (itemId) => {
  const nextItems = getCartItems().filter((item) => item.itemId !== itemId);
  setCartItems(nextItems);
  return nextItems;
};

export const getCartSummary = (items) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = items.length ? items[0].deliveryFee || 0 : 0;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    totalItems,
  };
};
