"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Star, Quote, CheckCircle2 } from "lucide-react";

interface Testimonial {
  name: string;
  nameHi: string;
  initial: string;
  location: string;
  locationHi: string;
  role: string;
  roleHi: string;
  rating: number;
  quote: string;
  quoteHi: string;
}

const testimonialsData: Testimonial[] = [
  {
    name: "Dr. Radhika Sen",
    nameHi: "डॉ. राधिका सेन",
    initial: "R",
    location: "Gurugram, Haryana",
    locationHi: "गुरुग्राम, हरियाणा",
    role: "Katha Devotee & Donor",
    roleHi: "कथा श्रोता एवं सेवा सहयोगी",
    rating: 5,
    quote:
      "Attending Pujya Sadhvi Ji's Shrimad Bhagwat Katha brought profound peace to our family during a very difficult year. Her discourse on selfless duty in the Gita gave us clarity and strength.",
    quoteHi:
      "पूज्य साध्वी जी की श्रीमद्भागवत कथा में भाग लेने से हमारे परिवार को कठिन समय में अलौकिक शांति मिली। गीता के निष्काम कर्म पर उनके मार्गदर्शन ने हमें संबल और आत्मिक बल प्रदान किया।",
  },
  {
    name: "Maharaj Singh Rawat",
    nameHi: "महाराज सिंह रावत",
    initial: "M",
    location: "Indore, Madhya Pradesh",
    locationHi: "इंदौर, मध्य प्रदेश",
    role: "Gurukul Sponsor",
    roleHi: "गुरुकुल शिक्षा सहयोगी",
    rating: 5,
    quote:
      "Seeing the Gurukul students chant Sanskrit shlokas with pure devotion convinced me that our heritage is in the right hands. Sponsoring a child's education here has been my most rewarding seva.",
    quoteHi:
      "गुरुकुल के विद्यार्थियों को पूरी निष्ठा से संस्कृत श्लोकों का पाठ करते देखकर विश्वास हुआ कि हमारी संस्कृति सुरक्षित हाथों में है। यहां एक बच्चे की शिक्षा सहयोग देना मेरा सबसे सार्थक पुण्य रहा है।",
  },
  {
    name: "Anuradha Sharma",
    nameHi: "अनुराधा शर्मा",
    initial: "A",
    location: "Delhi NCR",
    locationHi: "दिल्ली एनसीआर",
    role: "Annadanam Volunteer",
    roleHi: "अन्नदान सेवादार",
    rating: 5,
    quote:
      "Volunteering in the daily Mahaprasad distribution opened my eyes to the power of compassionate action. Every plate served carries sacred love, dignity, and warmth for those in need.",
    quoteHi:
      "दैनिक महाप्रसाद वितरण में सेवादार बनकर सेवा करने से करुणा और समरसता का सच्चा अर्थ समझ आया। यहां हर थाली प्रेम, सम्मान और शुद्ध सात्विक भावना के साथ परोसी जाती है।",
  },
  {
    name: "Bipin Chandra Joshi",
    nameHi: "बिपिन चंद्र जोशी",
    initial: "B",
    location: "Haridwar, Uttarakhand",
    locationHi: "हरिद्वार, उत्तराखंड",
    role: "Annual Member",
    roleHi: "ट्रस्ट वार्षिक सदस्य",
    rating: 5,
    quote:
      "The transparency and dedication of Namo Bhagwate Vasudevaya Trust inspire immense trust. You receive authentic updates, proper seva receipts, and see tangible impact on the ground.",
    quoteHi:
      "नमो भगवते वासुदेवाय ट्रस्ट की पारदर्शिता और निष्ठा अटूट विश्वास जगाती है। हर सेवा की प्रामाणिक रसीद और समाज में दिख रहा वास्तविक बदलाव मन को संतुष्टि देता है।",
  },
  {
    name: "Meenakshi Sundaram",
    nameHi: "मीनाक्षी सुंदरम",
    initial: "M",
    location: "Vrindavan, Uttar Pradesh",
    locationHi: "वृंदावन, उत्तर प्रदेश",
    role: "Wellness Camp Participant",
    roleHi: "स्वास्थ्य शिविर प्रतिभागी",
    rating: 5,
    quote:
      "The Ayurvedic wellness and yoga camp in Vrindavan rejuvenated both body and spirit. Learning traditional pranayama and satvik living has permanently enriched my daily routine.",
    quoteHi:
      "वृंदावन के योग एवं प्राकृतिक चिकित्सा शिविर ने तन और मन दोनों को नई ऊर्जा दी। पारंपरिक प्राणायाम और सात्विक जीवन शैली की सीख ने मेरी दैनिक दिनचर्या को पूरी तरह बदल दिया।",
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
      aria-label="Devotee Testimonials"
    >
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading matching site typography and warm badge (Fixes PM Finding 3) */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-2">
          <span className="inline-block px-3.5 py-1 rounded-full bg-[#E86F1D]/10 text-[#E86F1D] text-[11px] font-bold uppercase tracking-widest border border-[#E86F1D]/20">
            {lang === "hi" ? "भक्तों के पावन अनुभव" : "Devotee Experiences"}
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#2B201A]">
            {lang === "hi" ? "हमारे भक्त क्या कहते हैं" : "Voices of Faith & Devotion"}
          </h2>
          <p className="text-sm text-[#7A6B60] max-w-lg mx-auto">
            {lang === "hi"
              ? "कथा, गुरुकुल एवं सेवा प्रकल्पों से जुड़े श्रद्धालुओं के आत्मीय विचार एवं अनुभव।"
              : "Heartfelt reflections and personal experiences shared by devotees and seva contributors."}
          </p>
        </div>

        {/* Carousel Viewport (NO overlapping buttons over cards) */}
        <div className="relative overflow-hidden px-1 py-1" ref={emblaRef}>
          <div className="flex -ml-4 sm:-ml-6 touch-pan-y">
            {testimonialsData.map((item, idx) => (
              <div
                key={idx}
                className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-4 sm:pl-6 min-w-0"
              >
                {/* Testimonial Card with authentic styling */}
                <div className="h-full bg-white rounded-2xl border border-[#E7D8C8] p-5 sm:p-6 shadow-[0_4px_16px_-2px_rgba(43,32,26,0.06)] hover:border-[#E86F1D] hover:shadow-warm-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
                  <div className="space-y-3.5">
                    {/* Top Row: Quote Icon + Role Badge */}
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-[#E86F1D]/10 text-[#E86F1D] flex items-center justify-center">
                        <Quote className="w-4 h-4 fill-current rotate-180" />
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#2F5A43] bg-[#E8F5E9] border border-[#C8E6C9] px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-[#2F5A43]" />
                        <span>{lang === "hi" ? item.roleHi : item.role}</span>
                      </span>
                    </div>

                    {/* Devotee Info: Avatar + Name & Location */}
                    <div className="flex items-center gap-3 pt-1">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#E86F1D] to-[#B8893E] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm">
                        {item.initial}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-editorial font-bold text-sm sm:text-base text-[#2B201A] group-hover:text-[#E86F1D] transition-colors truncate">
                          {lang === "hi" ? item.nameHi : item.name}
                        </h3>
                        <p className="text-[11.5px] text-[#7A6B60] font-medium truncate">
                          {lang === "hi" ? item.locationHi : item.location}
                        </p>
                      </div>
                    </div>

                    {/* 5 Golden Stars */}
                    <div className="flex items-center gap-1 pt-0.5">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-3.5 h-3.5 fill-[#E86F1D] text-[#E86F1D]"
                        />
                      ))}
                    </div>

                    {/* Testimonial Quote */}
                    <p className="text-xs sm:text-[13px] text-[#4A3E38] leading-relaxed italic">
                      &ldquo;{lang === "hi" ? item.quoteHi : item.quote}&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Bottom Controls: Prev + Indicators + Next (Cleanly below track, zero card overlap) */}
        <div className="flex items-center justify-center gap-4 mt-7 sm:mt-9">
          <button
            onClick={scrollPrev}
            className="w-10 h-10 rounded-full border border-[#E7D8C8] bg-white hover:bg-[#E86F1D] text-[#2B201A] hover:text-white flex items-center justify-center shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2]" />
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {scrollSnaps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollTo(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  selectedIndex === idx
                    ? "w-8 bg-[#E86F1D]"
                    : "w-2.5 bg-[#E86F1D]/25 hover:bg-[#E86F1D]/50"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={scrollNext}
            className="w-10 h-10 rounded-full border border-[#E7D8C8] bg-white hover:bg-[#E86F1D] text-[#2B201A] hover:text-white flex items-center justify-center shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5 stroke-[2]" />
          </button>
        </div>
      </div>
    </section>
  );
}
