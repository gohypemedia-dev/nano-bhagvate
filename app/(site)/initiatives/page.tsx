"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { HeartPulse, GraduationCap, Users, HeartHandshake, CheckCircle2, Heart } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function InitiativesPage() {
  const { lang, openDonateModal } = useApp();

  const initiatives = [
    {
      id: "health",
      title: "Health & Wellness Initiatives",
      titleHi: "स्वास्थ्य एवं प्राकृतिक कल्याण सेवा",
      description: "Providing accessible healthcare, medical assistance, and promoting holistic wellness through Ayurveda and Yoga in rural communities.",
      descriptionHi: "ग्रामीण और वंचित क्षेत्रों में मुफ्त चिकित्सा शिविर, योग और प्राकृतिक स्वास्थ्य सेवाएं प्रदान करना।",
      image: "/images/initiative-health.jpg",
      icon: HeartPulse,
      bullets: [
        "Free medical camps in rural and underserved regions",
        "Yoga and Ayurvedic wellness programs for holistic health",
        "Mental health awareness and stress management initiatives",
        "Free distribution of essential medicines and health kits",
      ],
    },
    {
      id: "education",
      title: "Education & Gurukul Development",
      titleHi: "शिक्षा एवं गुरुकुल विकास परियोजना",
      description: "Preserving Vedic traditions while integrating modern education, science, and IT for holistic youth development.",
      descriptionHi: "युवाओं के सर्वांगीण विकास के लिए आधुनिक शिक्षा और मूल्यों को एकीकृत करते हुए वैदिक परंपराओं का संरक्षण।",
      image: "/images/initiative-education.jpg",
      icon: GraduationCap,
      bullets: [
        "Gurukul establishment and traditional Vedic education management",
        "Free education and study material for underprivileged children",
        "Seamless integration of Vedic wisdom with modern science & IT",
        "Moral values (Sanskar) and character building workshops",
      ],
    },
    {
      id: "women",
      title: "Women Empowerment",
      titleHi: "महिला सशक्तिकरण एवं कौशल विकास",
      description: "Fostering economic independence and self-reliance for women through vocational skills, training, and guidance.",
      descriptionHi: "व्यावसायिक कौशलों और मार्गदर्शन के माध्यम से महिलाओं के लिए आर्थिक स्वतंत्रता और स्वावलंबन को बढ़ावा देना।",
      image: "/images/initiative-women.jpg",
      icon: Users,
      bullets: [
        "Skill-development workshops in tailoring, handicrafts & IT",
        "Self-reliance and small-scale entrepreneurship support",
        "Social, legal, and financial literacy guidance for women",
        "Self-defense and confidence building camps",
      ],
    },
    {
      id: "welfare",
      title: "Social Welfare & Humanitarian Support",
      titleHi: "सामाजिक कल्याण एवं सर्वजन सेवा",
      description: "Delivering essential relief, food distribution, and compassionate care to vulnerable communities and elder citizens.",
      descriptionHi: "कमजोर वर्गों और वरिष्ठ नागरिकों को आवश्यक राहत, पोषण और करुणामय देखभाल प्रदान करना।",
      image: "/images/initiative-farmers.jpg",
      icon: HeartHandshake,
      bullets: [
        "Regular food (Annadan) and warm clothing distribution drives",
        "Comprehensive support for orphans, widows, and vulnerable groups",
        "Care and medical support for elderly and underprivileged citizens",
        "Disaster relief and emergency humanitarian assistance",
      ],
    },
  ];

  return (
    <div className="w-full space-y-0">
      {/* HERO SECTION */}
      <section className="relative py-14 md:py-20 bg-[#FBF2E7] border-b border-[#E7D8C8]">
        <div className="page-container text-center space-y-4 max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-widest text-[#E86F1D]">SEVA IN ACTION</p>
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2B201A]">
            Transforming Lives Through Service
          </h1>
          <p className="text-base sm:text-lg text-[#2B201A]/85 leading-relaxed font-sans max-w-2xl mx-auto">
            Our initiatives are designed to empower individuals, nurture communities, and create meaningful long-term impact. Guided by the values of the Bhagavad Gita, each program brings compassion together with practical support.
          </p>
        </div>
      </section>

      {/* 4 PRIMARY INITIATIVE CARDS */}
      <section className="section-py">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
            {initiatives.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.id}
                  className="card-warm p-0 overflow-hidden flex flex-col justify-between"
                >
                  {/* 1. Initiative Image (TOP) */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#2B201A]">
                    <Image
                      src={item.image}
                      alt={lang === "hi" ? item.titleHi : item.title}
                      fill
                      className="object-cover object-center transition-transform duration-500 hover:scale-105"
                      priority={idx === 0}
                    />
                  </div>

                  {/* Content Body */}
                  <div className="p-6 sm:p-8 flex flex-col flex-1 justify-between space-y-6">
                    <div className="space-y-4">
                      {/* 2. Category Label */}
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E86F1D]/10 text-[#E86F1D] rounded-full text-xs font-bold uppercase tracking-wider w-fit">
                        <IconComp className="w-4 h-4" />
                        <span>Initiative 0{idx + 1}</span>
                      </div>

                      {/* 3. Initiative Title */}
                      <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#2B201A]">
                        {lang === "hi" ? item.titleHi : item.title}
                      </h2>

                      {/* 4. Description */}
                      <p className="text-sm sm:text-base text-[#2B201A]/85 font-sans leading-relaxed">
                        {lang === "hi" ? item.descriptionHi : item.description}
                      </p>

                      {/* 5. Bullet Points */}
                      <ul className="space-y-3 text-sm text-[#2B201A]/85 font-sans pt-1">
                        {item.bullets.map((bullet, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-[#2F5A43] shrink-0 mt-0.5" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 6. Support Initiative and Volunteer With Us Buttons (BOTTOM) */}
                    <div className="pt-4 card-action flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 border-t border-[#E7D8C8] mt-auto">
                      <button
                        onClick={() => openDonateModal(item.title)}
                        className="btn-primary flex-1"
                      >
                        Support Initiative
                      </button>
                      <Link href="/contact" className="btn-outline flex-1 text-center">
                        Volunteer With Us
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PREMIUM CTA BANNER */}
      <section className="section-py bg-[#FBF2E7]/50 border-t border-[#E7D8C8]">
        <div className="page-container max-w-5xl">
          <div className="bg-gradient-to-r from-[#2B201A] to-[#3D2C24] text-white rounded-3xl p-8 sm:p-12 text-center border-2 border-[#B8893E] shadow-2xl space-y-6">
            <p className="text-xs font-bold uppercase tracking-widest text-[#B8893E]">JOIN THE SEVA MISSION</p>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold leading-tight">
              Serve with us. Support an initiative.
              <br />
              Help turn compassion into action.
            </h2>
            <p className="text-sm sm:text-base text-white/85 max-w-xl mx-auto font-sans">
              Every contribution directly powers our health camps, Gurukul education, women skill workshops, and farmer advisory programs.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 pt-4 max-w-md mx-auto">
              <Link href="/membership" className="btn-secondary flex-1 text-center">
                Become a Member
              </Link>
              <button
                onClick={() => openDonateModal("General Donation")}
                className="btn-primary flex-1"
              >
                <Heart className="w-4 h-4 fill-current text-white" />
                <span>Donate Now</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* STRICT RULE CONFIRMED: ZERO GALLERY SECTION HERE! */}
    </div>
  );
}

