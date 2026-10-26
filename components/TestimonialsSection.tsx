"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Star, CheckCircle2 } from "lucide-react";

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
  {
    name: "Rameshwar Nath Tiwari",
    nameHi: "रामेश्वर नाथ तिवारी",
    initial: "R",
    location: "Varanasi, Uttar Pradesh",
    locationHi: "वाराणसी, उत्तर प्रदेश",
    role: "Farmer Welfare Seva",
    roleHi: "जैविक कृषि एवं किसान कल्याण",
    rating: 5,
    quote:
      "The natural farming training organized by the Trust taught us how to cultivate without harmful chemicals. Our yields improved and our soil is fertile and vibrant again.",
    quoteHi:
      "ट्रस्ट द्वारा आयोजित प्राकृतिक कृषि कार्यशाला से हमें बिना रसायनों के खेती का मार्गदर्शन मिला। फसल की लागत घटी और भूमि की उर्वरता में अद्भुत सुधार आया।",
  },
  {
    name: "Sunita Agrawal",
    nameHi: "सुनीता अग्रवाल",
    initial: "S",
    location: "Mathura, Uttar Pradesh",
    locationHi: "मथुरा, उत्तर प्रदेश",
    role: "Women Empowerment Supporter",
    roleHi: "महिला स्वावलंबन सहयोगी",
    rating: 5,
    quote:
      "Seeing rural women become self-reliant through the Trust's skill centers is truly inspiring. The dignity and independence they gain transforms entire families.",
    quoteHi:
      "ट्रस्ट के कौशल केंद्र से ग्रामीण बहनों को सिलाई एवं हस्तशिल्प सीखकर आत्मनिर्भर बनते देखना अत्यंत प्रेरणादायी है। इससे परिवारों में आत्मसम्मान बढ़ा है।",
  },
  {
    name: "Acharya Devvrata Shastri",
    nameHi: "आचार्य देवव्रत शास्त्री",
    initial: "D",
    location: "Rishikesh, Uttarakhand",
    locationHi: "ऋषिकेश, उत्तराखंड",
    role: "Vedic Scholar & Devotee",
    roleHi: "वैदिक विद्वान एवं साधक",
    rating: 5,
    quote:
      "The Trust's dedication to reviving Vedic wisdom and Sanatan traditions while serving humanity with pure humility is exemplary in today's times.",
    quoteHi:
      "सनातन संस्कृति और वैदिक मूल्यों के संरक्षण के साथ-साथ समाज के अंतिम व्यक्ति तक सेवा पहुँचाने का यह संकल्प आज के युग में अद्वितीय और अनुकरणीय है।",
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
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-2">
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#2B201A]">
            {lang === "hi" ? "हमारे भक्त क्या कहते हैं" : "Voices of Faith & Devotion"}
          </h2>
          <p className="text-sm text-[#7A6B60] max-w-lg mx-auto">
            {lang === "hi"
              ? "कथा, गुरुकुल एवं सेवा प्रकल्पों से जुड़े श्रद्धालुओं के आत्मीय विचार एवं अनुभव।"
              : "Heartfelt reflections and personal experiences shared by devotees and seva contributors."}
          </p>
        </div>

        {/* Carousel Container with Side Controls for Desktop (Positioned cleanly outside cards) */}
        <div className="relative flex items-center">
          {/* Desktop Left Button */}
          <button
            onClick={scrollPrev}
            className="hidden md:flex shrink-0 mr-2.5 lg:mr-3.5 w-11 h-11 rounded-full border border-[#E7D8C8] bg-white hover:bg-[#E86F1D] text-[#2B201A] hover:text-white items-center justify-center shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2]" />
          </button>

          {/* Carousel Viewport (NO overlapping buttons over cards) */}
          <div className="relative overflow-hidden px-1 py-2 flex-1 min-w-0" ref={emblaRef}>
            <div className="flex -ml-4 sm:-ml-5 touch-pan-y">
              {testimonialsData.map((item, idx) => (
                <div
                  key={idx}
                  className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_25%] pl-4 sm:pl-5 min-w-0"
                >
                  {/* Testimonial Card with authentic styling */}
                  <div className="h-full bg-white rounded-2xl border border-[#E7D8C8] p-5 sm:p-5.5 shadow-[0_4px_16px_-2px_rgba(43,32,26,0.06)] hover:border-[#E86F1D] hover:shadow-warm-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
                    <div className="space-y-3">
                      {/* Top Row: Role Badge */}
                      <div className="flex items-center justify-end">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2F5A43] bg-[#E8F5E9] border border-[#C8E6C9] px-2.5 py-0.5 rounded-full truncate max-w-[170px]">
                          <CheckCircle2 className="w-3 h-3 text-[#2F5A43] shrink-0" />
                          <span className="truncate">{lang === "hi" ? item.roleHi : item.role}</span>
                        </span>
                      </div>

                      {/* Devotee Info: Avatar + Name & Location */}
                      <div className="flex items-center gap-3 pt-1">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E86F1D] to-[#B8893E] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                          {item.initial}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-editorial font-bold text-sm sm:text-[15px] text-[#2B201A] group-hover:text-[#E86F1D] transition-colors truncate">
                            {lang === "hi" ? item.nameHi : item.name}
                          </h3>
                          <p className="text-[11px] text-[#7A6B60] font-medium truncate">
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
                      <p className="text-xs sm:text-[12.5px] text-[#4A3E38] leading-relaxed italic line-clamp-4">
                        &ldquo;{lang === "hi" ? item.quoteHi : item.quote}&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Right Button */}
          <button
            onClick={scrollNext}
            className="hidden md:flex shrink-0 ml-2.5 lg:ml-3.5 w-11 h-11 rounded-full border border-[#E7D8C8] bg-white hover:bg-[#E86F1D] text-[#2B201A] hover:text-white items-center justify-center shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* Carousel Bottom Controls: Mobile Prev/Next + Indicators on all screens */}
        <div className="flex items-center justify-center gap-4 mt-7 sm:mt-9">
          {/* Mobile Prev Button */}
          <button
            onClick={scrollPrev}
            className="md:hidden w-10 h-10 rounded-full border border-[#E7D8C8] bg-white hover:bg-[#E86F1D] text-[#2B201A] hover:text-white flex items-center justify-center shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2]" />
          </button>

          {/* Slide Indicator Dots */}
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

          {/* Mobile Next Button */}
          <button
            onClick={scrollNext}
            className="md:hidden w-10 h-10 rounded-full border border-[#E7D8C8] bg-white hover:bg-[#E86F1D] text-[#2B201A] hover:text-white flex items-center justify-center shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5 stroke-[2]" />
          </button>
        </div>
      </div>
    </section>
  );
}
