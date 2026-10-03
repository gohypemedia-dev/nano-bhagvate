"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ShoppingBag, Plus, Minus, CheckCircle2, ShieldCheck, Truck, Star } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function BooksPage() {
  const { lang, addToCart, setIsCartOpen } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  const product = {
    id: "sugarcane-guide-01",
    title: "Guide to Sugarcane Farming in North India (गन्ना खेती मार्गदर्शिका)",
    titleHi: "गन्ना खेती मार्गदर्शिका - उत्तरी भारत के किसानों हेतु व्यापक गाइड",
    price: 95.0,
    image: "/images/book-cover.jpg",
  };

  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
      },
      quantity
    );
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(
      {
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
      },
      quantity
    );
    setIsCartOpen(true);
  };

  const highlights = [
    {
      title: "Practical Guidance",
      titleHi: "व्यावहारिक एवं व्यावहारिक मार्गदर्शन",
      desc: "Clear, field-oriented techniques presented in a direct, step-by-step easy-to-follow format.",
    },
    {
      title: "Simple Language",
      titleHi: "सरल एवं सुगम हिंदी भाषा",
      desc: "Written in accessible Hindi so sugarcane farmers can understand and apply soil & crop science with confidence.",
    },
    {
      title: "Modern Agricultural Insight",
      titleHi: "आधुनिक कृषि विज्ञान एवं अनुभव",
      desc: "Brings together practical farming experience and agronomy research to lower avoidable costs and boost yield.",
    },
    {
      title: "Purpose-Led Publication",
      titleHi: "किसान स्वावलंबन हेतु ट्रस्ट की पहल",
      desc: "Positioned as a non-profit knowledge resource created to strengthen farmer self-reliance and long-term livelihood resilience.",
    },
  ];

  return (
    <div className="w-full space-y-0">
      {/* HERO / PRODUCT DISPLAY SECTION */}
      <section className="py-12 md:py-20 bg-[#FBF2E7] border-b border-[#E7D8C8]">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left Product Image Gallery */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative w-full max-w-md aspect-[3/4] rounded-3xl overflow-hidden border-4 border-[#FFF9F2] shadow-2xl group bg-[#FFF9F2]">
                <Image
                  src={product.image}
                  alt="Guide to Sugarcane Farming in North India"
                  fill
                  className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                  priority
                />
                <div className="absolute top-4 left-4 bg-[#E86F1D] text-white text-xs font-bold px-3 py-1 rounded-full shadow-warm-sm">
                  OFFICIAL PUBLICATION
                </div>
              </div>
            </div>

            {/* Right Product Info & Actions */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B8893E] uppercase tracking-widest">
                  <Star className="w-4 h-4 fill-current text-[#B8893E]" />
                  <span>AGRICULTURAL KNOWLEDGE SERIES</span>
                </div>
                <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2B201A] leading-tight">
                  {lang === "hi" ? product.titleHi : product.title}
                </h1>
                <p className="text-sm text-[#2B201A]/70 font-medium">
                  Published by Namo Bhagwate Vasudevaya Trust • Language: Hindi (देवनागरी)
                </p>
              </div>

              {/* Price */}
              <div className="py-3 border-y border-[#E7D8C8] flex flex-wrap items-baseline gap-3">
                <span className="font-editorial text-4xl font-bold text-[#E86F1D]">
                  ₹{product.price.toFixed(2)}
                </span>
                <span className="text-sm font-semibold text-[#2B201A]/60">INR</span>
                <span className="text-xs text-[#2F5A43] font-bold bg-[#2F5A43]/10 px-2.5 py-1 rounded-md ml-auto sm:ml-0">
                  In Stock & Ready to Ship
                </span>
              </div>

              <p className="text-sm sm:text-base text-[#2B201A]/85 leading-relaxed font-sans">
                A practical handbook for sugarcane farmers in North India, combining field-oriented guidance, scientific soil preparation insights, and accessible information to support higher yield, reduce avoidable input costs, and promote sustainable agriculture.
              </p>

              {/* Quantity Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2B201A]/80">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <div className="inline-flex items-center border border-[#E7D8C8] bg-[#FFF9F2] rounded-xl p-1 shadow-warm-sm">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-2 text-[#2B201A] hover:text-[#E86F1D] min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 text-sm font-bold">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="p-2 text-[#2B201A] hover:text-[#E86F1D] min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-[#2B201A]/70 font-semibold">
                    Total: <strong>₹{(product.price * quantity).toFixed(2)} INR</strong>
                  </span>
                </div>
              </div>

              {/* Cart Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button
                  onClick={handleAddToCart}
                  className="btn-outline w-full border-2 border-[#E86F1D] text-[#E86F1D]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{addedNotice ? "Added to Cart!" : "Add to Cart"}</span>
                </button>

                <button onClick={handleBuyNow} className="btn-primary w-full">
                  <span>Buy It Now</span>
                </button>
              </div>

              {/* Delivery info */}
              <div className="pt-4 grid grid-cols-2 gap-4 text-xs text-[#2B201A]/75 font-semibold border-t border-[#E7D8C8]">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#B8893E]" />
                  <span>Pan-India Courier Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#2F5A43]" />
                  <span>Official Trust Publication</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT HIGHLIGHTS GRID */}
      <section className="section-py">
        <div className="page-container">
          <div className="text-center max-w-2xl mx-auto section-header space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[#E86F1D]">WHY READ THIS GUIDE?</p>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#2B201A]">
              Product Highlights & Value
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {highlights.map((h, idx) => (
              <div key={idx} className="card-warm space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#2F5A43] shrink-0" />
                  <h3 className="font-editorial text-2xl font-bold text-[#2B201A]">
                    {lang === "hi" ? h.titleHi : h.title}
                  </h3>
                </div>
                <p className="text-sm text-[#2B201A]/85 leading-relaxed font-sans pl-9">
                  {h.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
