export interface CartItem {
  id_producto: number;
  nombre: string;
  precio: number;
  marca: string;
  imagen_url?: string;
  stock: number;
  cantidad: number;
}

const CART_STORAGE_KEY = "tienda_carrito";

const safeJsonParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const loadCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  return safeJsonParse<CartItem[]>(window.localStorage.getItem(CART_STORAGE_KEY), []);
};

export const saveCart = (cart: CartItem[]) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error("No se pudo guardar el carrito en localStorage:", error);
  }
};

export const addOrUpdateCartItem = (nextItem: CartItem) => {
  const cart = loadCart();
  const existingIndex = cart.findIndex((item) => item.id_producto === nextItem.id_producto);

  if (existingIndex >= 0) {
    const existingItem = cart[existingIndex];
    cart[existingIndex] = {
      ...existingItem,
      cantidad: Math.min(existingItem.stock, existingItem.cantidad + nextItem.cantidad),
    };
  } else {
    cart.push(nextItem);
  }

  saveCart(cart);
  return cart;
};

export const removeCartItem = (id_producto: number) => {
  const cart = loadCart().filter((item) => item.id_producto !== id_producto);
  saveCart(cart);
  return cart;
};

export const updateCartQuantity = (id_producto: number, cantidad: number) => {
  const cart = loadCart().map((item) =>
    item.id_producto === id_producto
      ? { ...item, cantidad: Math.min(item.stock, Math.max(1, cantidad)) }
      : item
  );
  saveCart(cart);
  return cart;
};
