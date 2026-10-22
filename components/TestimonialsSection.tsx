"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

interface Testimonial {
  name: string;
  nameHi: string;
  initial: string;
  location: string;
  locationHi: string;
  quote: string;
  quoteHi: string;
}

const testimonialsData: Testimonial[] = [
  {
    name: "RAJESH KUMAR",
    nameHi: "राजेश कुमार",
    initial: "R",
    location: "Mumbai",
    locationHi: "मुंबई",
    quote:
      "The spiritual guidance I received here has been life-changing. Every visit fills my heart with devotion and peace.",
    quoteHi:
      "यहाँ से प्राप्त आध्यात्मिक मार्गदर्शन जीवन को बदलने वाला रहा है। हर यात्रा मेरे हृदय को भक्ति और शांति से भर देती है।",
  },
  {
    name: "PRIYA SHARMA",
    nameHi: "प्रिया शर्मा",
    initial: "P",
    location: "Delhi",
    locationHi: "दिल्ली",
    quote:
      "A truly blessed experience. The community's warmth and the divine atmosphere have strengthened my faith immensely.",
    quoteHi:
      "अत्यंत पवित्र और प्रेरणादायक अनुभव। समुदाय का स्नेह और दिव्य वातावरण ने मेरे विश्वास को और प्रगाढ़ किया है।",
  },
  {
    name: "AMIT PATEL",
    nameHi: "अमित पटेल",
    initial: "A",
    location: "Ahmedabad",
    locationHi: "अहमदाबाद",
    quote:
      "Finding this spiritual home has been the greatest blessing. The teachings have brought clarity and joy to my daily life.",
    quoteHi:
      "इस आध्यात्मिक सदन से जुड़ना सबसे बड़ा आशीर्वाद रहा है। पावन उपदेशों ने दैनिक जीवन में स्पष्टता और आनंद ला दिया है।",
  },
  {
    name: "SUNITA VERMA",
    nameHi: "सुनीता वर्मा",
    initial: "S",
    location: "Jaipur",
    locationHi: "जयपुर",
    quote:
      "The Gurukul and Seva initiatives run by the trust are deeply inspiring. Being a part of this mission brings true fulfillment.",
    quoteHi:
      "ट्रस्ट द्वारा संचालित गुरुकुल और सेवा कार्य अत्यंत प्रेरणादायक हैं। इस पावन अभियान का हिस्सा बनना आत्मिक संतोष देता है।",
  },
  {
    name: "VIKRAMADITYA RATHORE",
    nameHi: "विक्रमादित्य राठौड़",
    initial: "V",
    location: "Indore",
    locationHi: "इंदौर",
    quote:
      "Participating in the Bhagwat Katha awakened a new spiritual energy within me. A profound and soulful environment.",
    quoteHi:
      "भागवत कथा में सम्मिलित होने से भीतर एक नई आध्यात्मिक ऊर्जा का संचार हुआ। अत्यंत दिव्य और अलौकिक वातावरण।",
  },
];

interface TestimonialsSectionProps {
  lang?: string;
}

export default function TestimonialsSection({ lang = "en" }: TestimonialsSectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const autoplayTimer = useRef<NodeJS.Timeout | null>(null);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  // Autoplay functionality (6 seconds, pauses on hover)
  const startAutoplay = useCallback(() => {
    if (autoplayTimer.current) clearInterval(autoplayTimer.current);
    autoplayTimer.current = setInterval(() => {
      if (emblaApi && !isHovered) {
        emblaApi.scrollNext();
      }
    }, 6000);
  }, [emblaApi, isHovered]);

  useEffect(() => {
    startAutoplay();
    return () => {
      if (autoplayTimer.current) clearInterval(autoplayTimer.current);
    };
  }, [startAutoplay]);

  return (
    <section
      className="py-12 sm:py-16 bg-[#FFF9F2] border-t border-[#E7D8C8]/60 relative select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="page-container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading matching reference */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold uppercase tracking-wider text-black font-sans">
            {lang === "hi" ? "हमारे भक्त क्या कहते हैं" : "WHAT OUR DEVOTEES SAY"}
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm font-semibold text-[#E86F1D] tracking-wide">
            {lang === "hi"
              ? "हमारे समुदाय द्वारा साझा किए गए अनुभव और आशीर्वाद"
              : "Experiences and blessings shared by our community"}
          </p>
        </div>

        {/* Carousel Container with Overlapping Arrows */}
        <div className="relative">
          {/* Embla Viewport */}
          <div className="overflow-hidden px-1 py-1" ref={emblaRef}>
            <div className="flex -ml-4 sm:-ml-6 touch-pan-y">
              {testimonialsData.map((item, idx) => (
                <div
                  key={idx}
                  className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-4 sm:pl-6 min-w-0"
                >
                  {/* Testimonial Card matching reference */}
                  <div className="h-full bg-white rounded-xl border border-[#F5A623] p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      {/* Top Quote Icon */}
                      <div className="text-[#F5A623] leading-none mb-3">
                        <svg
                          className="w-5 h-5 fill-current"
                          viewBox="0 0 24 24"
                        >
                          <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
                        </svg>
                      </div>

                      {/* Devotee Info: Avatar + Name & Location */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#F59E0B] text-white flex items-center justify-center font-bold text-sm sm:text-base shrink-0 shadow-sm">
                          {item.initial}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-xs sm:text-[13px] text-[#E8622A] uppercase tracking-wide truncate">
                            {lang === "hi" ? item.nameHi : item.name}
                          </h3>
                          <p className="text-[11px] sm:text-xs text-neutral-500 font-medium">
                            {lang === "hi" ? item.locationHi : item.location}
                          </p>
                        </div>
                      </div>

                      {/* 5 Golden Stars */}
                      <div className="flex items-center gap-1 my-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3.5 h-3.5 fill-[#FFB800] text-[#FFB800]"
                          />
                        ))}
                      </div>

                      {/* Testimonial Quote */}
                      <p className="text-xs sm:text-[13px] text-neutral-700 leading-relaxed font-normal">
                        {lang === "hi" ? item.quoteHi : item.quote}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overlapping Orange Prev Button */}
          <button
            onClick={scrollPrev}
            className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#F28C28] hover:bg-[#D97706] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 z-20 cursor-pointer focus:outline-none"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5 text-white stroke-[2.5]" />
          </button>

          {/* Overlapping Orange Next Button */}
          <button
            onClick={scrollNext}
            className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#F28C28] hover:bg-[#D97706] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 z-20 cursor-pointer focus:outline-none"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5 text-white stroke-[2.5]" />
          </button>
        </div>

        {/* Bottom Active Slide Indicator (Pills/Dots) */}
        <div className="flex justify-center items-center gap-1.5 sm:gap-2 mt-6 sm:mt-8">
          {scrollSnaps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollTo(idx)}
              className={`h-2 rounded-full transition-all duration-300 focus:outline-none cursor-pointer ${
                selectedIndex === idx
                  ? "w-8 sm:w-10 bg-[#F28C28]"
                  : "w-2 bg-[#F28C28]/25 hover:bg-[#F28C28]/50"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
