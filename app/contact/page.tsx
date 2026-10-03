"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function ContactPage() {
  const { lang } = useApp();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="w-full space-y-0">
      {/* HERO SECTION */}
      <section className="relative py-14 md:py-20 bg-[#FBF2E7] border-b border-[#E7D8C8]">
        <div className="page-container text-center space-y-4 max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-widest text-[#E86F1D]">REACH OUT TO US</p>
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2B201A]">
            Let’s Stay Connected
          </h1>
          <p className="text-base sm:text-lg text-[#2B201A]/85 leading-relaxed font-sans max-w-2xl mx-auto">
            For membership, donations, programs, events, or general enquiries, reach out to the Trust and our team will guide you to the right next step.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT GRID */}
      <section className="section-py">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left Contact Form */}
            <div className="lg:col-span-7 card-warm p-8 sm:p-10 space-y-6">
              <h2 className="font-editorial text-3xl font-bold text-[#2B201A]">
                Send Us a Message
              </h2>

              {formSubmitted ? (
                <div className="p-8 bg-[#FFF9F2] rounded-2xl text-center space-y-4 border border-[#2F5A43]">
                  <CheckCircle2 className="w-12 h-12 text-[#2F5A43] mx-auto" />
                  <h3 className="font-editorial text-2xl font-bold text-[#2B201A]">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-sm text-[#2B201A]/85">
                    Thank you, <strong>{formData.fullName}</strong>. Your enquiry has been logged and our team will respond to <strong>{formData.email}</strong> within 24 hours.
                  </p>
                  <button onClick={() => setFormSubmitted(false)} className="btn-primary">
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#2B201A]/80 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Your full name"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="input-warm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#2B201A]/80 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input-warm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#2B201A]/80 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="input-warm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#2B201A]/80 mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Membership Enquiry"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="input-warm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2B201A]/80 mb-1">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="How can Namo Bhagwate Vasudevaya Trust assist you today?"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="input-warm"
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full">
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </button>
                </form>
              )}
            </div>

            {/* Right Contact Info Details & Map Card */}
            <div className="lg:col-span-5 space-y-6">
              <div className="card-warm space-y-6">
                <h2 className="font-editorial text-2xl font-bold text-[#2B201A]">
                  Trust Contact Details
                </h2>

                <ul className="space-y-4 text-sm">
                  <li className="flex items-start gap-4">
                    <div className="p-3 bg-[#E86F1D]/10 text-[#E86F1D] rounded-xl shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#2B201A]">Office Address</h4>
                      <p className="text-[#2B201A]/85 text-xs leading-relaxed mt-0.5">
                        P6/10, 4th Floor, DLF Phase 2, Gurugram, Haryana 122008, India
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-4">
                    <div className="p-3 bg-[#2F5A43]/10 text-[#2F5A43] rounded-xl shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#2B201A]">Phone / WhatsApp</h4>
                      <a href="tel:+918860665000" className="text-xs text-[#E86F1D] hover:underline font-semibold">
                        +91 88606 65000
                      </a>
                    </div>
                  </li>

                  <li className="flex items-start gap-4">
                    <div className="p-3 bg-[#B8893E]/10 text-[#B8893E] rounded-xl shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#2B201A]">Email Address</h4>
                      <a href="mailto:help@namobhagwatevasudevaya.com" className="text-xs text-[#E86F1D] hover:underline font-semibold">
                        help@namobhagwatevasudevaya.com
                      </a>
                    </div>
                  </li>

                  <li className="flex items-start gap-4">
                    <div className="p-3 bg-[#E86F1D]/10 text-[#E86F1D] rounded-xl shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#2B201A]">Seva Office Hours</h4>
                      <p className="text-xs text-[#2B201A]/85">
                        Monday – Saturday: 9:30 AM – 6:30 PM (IST)
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Interactive Location Placeholder Card */}
              <div className="card-warm bg-[#FFF9F2] text-center space-y-3">
                <MapPin className="w-8 h-8 text-[#B8893E] mx-auto animate-bounce" />
                <h4 className="font-editorial text-xl font-bold text-[#2B201A]">
                  DLF Phase 2, Gurugram Ashram
                </h4>
                <p className="text-xs text-[#2B201A]/75 max-w-xs mx-auto">
                  Visitors and devotees are welcome during office hours. Please call ahead for group satsang appointments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
