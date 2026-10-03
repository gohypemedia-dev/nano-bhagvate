"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight, CheckCircle2 } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, cartTotal, isCartOpen, setIsCartOpen, lang } = useApp();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setCheckoutSuccess(true);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FFF9F2] shadow-2xl flex flex-col border-l border-[#E7D8C8]">
          {/* Header */}
          <div className="p-6 bg-[#FBF2E7] border-b border-[#E7D8C8] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#E86F1D]" />
              <h2 className="font-editorial text-xl font-bold text-[#2B201A]">
                {lang === "hi" ? "आपकी कार्ट" : "Your Shopping Cart"}
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-[#2B201A]/60 hover:text-[#2B201A] rounded-lg hover:bg-[#FFF9F2]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {checkoutSuccess ? (
              <div className="text-center py-12 space-y-4">
                <CheckCircle2 className="w-16 h-16 text-[#2F5A43] mx-auto animate-bounce" />
                <h3 className="font-editorial text-2xl font-bold text-[#2B201A]">
                  {lang === "hi" ? "आर्डर सफलतापूर्वक स्वीकार किया गया!" : "Order Placed Successfully!"}
                </h3>
                <p className="text-sm text-[#2B201A]/80 max-w-xs mx-auto">
                  {lang === "hi"
                    ? "धन्यवाद! आपकी पुस्तक की प्रति शीघ्र ही आपके पते पर भेज दी जाएगी।"
                    : "Thank you for supporting Namo Bhagwate Vasudevaya Trust. Your publication will be dispatched shortly."}
                </p>
                <button
                  onClick={() => {
                    setCheckoutSuccess(false);
                    setIsCartOpen(false);
                  }}
                  className="mt-4 px-6 py-2.5 bg-[#E86F1D] text-white text-xs font-bold uppercase tracking-wider rounded-xl"
                >
                  Close Window
                </button>
              </div>
            ) : cart.length === 0 ? (
              <div className="text-center py-16 space-y-4 text-[#2B201A]/60">
                <ShoppingBag className="w-12 h-12 mx-auto stroke-1 text-[#B8893E]" />
                <p className="text-base font-medium">
                  {lang === "hi" ? "आपकी कार्ट खाली है।" : "Your cart is currently empty."}
                </p>
                <p className="text-xs">
                  {lang === "hi" ? "पुस्तकों का संग्रह देखने के लिए नीचे दिए गए बटन पर क्लिक करें।" : "Explore our agricultural & spiritual publications."}
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-[#FBF2E7] rounded-xl border border-[#E7D8C8] shadow-warm-sm"
                >
                  <div className="relative w-20 h-24 rounded-lg overflow-hidden shrink-0 border border-[#E7D8C8]">
                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#2B201A] line-clamp-2">{item.title}</h4>
                      <p className="text-sm font-semibold text-[#E86F1D] mt-1">₹{item.price.toFixed(2)} INR</p>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-[#E7D8C8] bg-[#FFF9F2] rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 hover:text-[#E86F1D]"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 hover:text-[#E86F1D]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {!checkoutSuccess && cart.length > 0 && (
            <div className="p-6 bg-[#FBF2E7] border-t border-[#E7D8C8] space-y-4">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-[#2B201A]/80">{lang === "hi" ? "उप-योग (Subtotal)" : "Subtotal"}</span>
                <span className="font-bold text-lg text-[#2B201A]">₹{cartTotal.toFixed(2)} INR</span>
              </div>
              <p className="text-xs text-[#2B201A]/60">
                {lang === "hi"
                  ? "कर एवं शिपिंग चेकआउट के समय जोड़े जाएंगे।"
                  : "Taxes and shipping calculated at checkout."}
              </p>
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full py-3 bg-[#E86F1D] hover:bg-[#D25E12] text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-warm-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isCheckingOut ? (
                  <span>Processing Checkout...</span>
                ) : (
                  <>
                    <span>{lang === "hi" ? "चेकआउट करें (Proceed to Checkout)" : "Proceed to Checkout"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
