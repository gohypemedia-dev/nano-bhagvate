"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// Details already typed elsewhere (e.g. the membership registration form), used to fill the donate modal.
export interface DonorPrefill {
  name?: string;
  email?: string;
  mobile?: string;
}

interface DonateModalState {
  isOpen: boolean;
  program?: string;
  amount?: number;
  isMembership?: boolean;
  prefill?: DonorPrefill;
}

export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface UserMembership {
  tier: string;
  tierName?: string;
  tierNameHi?: string;
  status: string;
  program?: string | null;
  donationId?: string | null;
  amountPaise?: number | null;
  verifiedAt?: string | null;
  benefits?: readonly string[];
  price?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  createdAt?: string;
  membership?: UserMembership | null;
}

interface AppContextType {
  lang: "en" | "hi";
  setLang: (lang: "en" | "hi") => void;
  // Cart
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  // Donate modal
  donateModal: DonateModalState;
  openDonateModal: (program?: string, amount?: number, isMembership?: boolean, prefill?: DonorPrefill) => void;
  closeDonateModal: () => void;
  // User Auth
  user: UserProfile | null;
  isLoadingUser: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: (onSuccess?: () => void) => void;
  closeAuthModal: () => void;
  authModalSuccessCallback?: (() => void) | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [donateModal, setDonateModal] = useState<DonateModalState>({ isOpen: false });

  // Synchronize document lang and lang-hi class on html element
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      if (lang === "hi") {
        document.documentElement.classList.add("lang-hi");
      } else {
        document.documentElement.classList.remove("lang-hi");
      }
    }
  }, [lang]);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nbvt_cart");
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem("nbvt_cart", JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  // User auth state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authSuccessCb, setAuthSuccessCb] = useState<(() => void) | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setUser(null);
  };

  const openAuthModal = (onSuccess?: () => void) => {
    setAuthSuccessCb(() => onSuccess || null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthSuccessCb(null);
  };

  const addToCart = (item: Omit<CartItem, "quantity">, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i));
      }
      return [...prev, { ...item, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.id === id) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const openDonateModal = (program?: string, amount?: number, isMembership?: boolean, prefill?: DonorPrefill) => {
    setDonateModal({ isOpen: true, program, amount, isMembership, prefill });
  };

  const closeDonateModal = () => {
    setDonateModal({ isOpen: false });
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        donateModal,
        openDonateModal,
        closeDonateModal,
        user,
        isLoadingUser,
        refreshUser,
        logout,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalSuccessCallback: authSuccessCb,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
}
