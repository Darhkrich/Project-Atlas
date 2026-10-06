"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
} from "react";

export type CartItem = {
  id: string;
  productId: string;
  variantId?: string;
  variantLabel?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

export type AddItemInput = {
  id: string;
  productId?: string;
  variantId?: string;
  variantLabel?: string;
  name: string;
  price: number;
  image: string;
  quantity?: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: AddItemInput) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (input: AddItemInput) => {
    const addQty = input.quantity ?? 1;
    if (addQty <= 0) return;

    setItems((prev) => {
      const existing = prev.find((i) => i.id === input.id);
      if (existing) {
        return prev.map((i) =>
          i.id === input.id
            ? { ...i, quantity: i.quantity + addQty }
            : i
        );
      }
      const newItem: CartItem = {
        id: input.id,
        productId: input.productId ?? input.id,
        variantId: input.variantId,
        variantLabel: input.variantLabel,
        name: input.name,
        price: input.price,
        image: input.image,
        quantity: addQty,
      };
      return [...prev, newItem];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}