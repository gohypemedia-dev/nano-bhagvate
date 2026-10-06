"use client";

import React from "react";
import { ShieldCheck, Lock } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function PrivacyPolicyPage() {
  const { lang } = useApp();

  return (
    <div className="w-full space-y-0">
      {/* HERO SECTION */}
      <section className="py-14 bg-[#FBF2E7] border-b border-[#E7D8C8]">
        <div className="page-container text-center space-y-3 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#FFF9F2] border border-[#B8893E]/30 rounded-full text-xs font-bold text-[#B8893E] uppercase tracking-widest mx-auto">
            <ShieldCheck className="w-4 h-4 text-[#2F5A43]" />
            <span>LEGAL DOCUMENTATION</span>
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-[#2B201A]">
            Privacy Policy
          </h1>
          <p className="text-xs text-[#2B201A]/60 font-semibold">
            Last Updated: October 1, 2026 • Namo Bhagwate Vasudevaya Trust
          </p>
        </div>
      </section>

      {/* PRIVACY CONTENT CONTAINER */}
      <section className="section-py">
        <div className="page-container max-w-4xl">
          <div className="card-warm p-8 sm:p-12 space-y-8 font-sans text-base text-[#2B201A]/85 leading-relaxed">
            <div className="p-4 bg-[#FFF9F2] rounded-2xl border border-[#E7D8C8] flex items-center gap-3 text-xs text-[#2B201A]/80 font-medium">
              <Lock className="w-5 h-5 text-[#E86F1D] shrink-0" />
              <span>
                Namo Bhagwate Vasudevaya Trust is committed to protecting your personal privacy. This Privacy Policy explains how your information is collected, used, and safeguarded when you visit namobhagwatevasudevaya.com.
              </span>
            </div>

            <div className="space-y-4">
              <h2 className="font-editorial text-2xl font-bold text-[#2B201A] border-b border-[#E7D8C8] pb-2">
                1. Information We Collect
              </h2>
              <p>
                We collect information that you voluntarily provide to us when registering for membership, making a donation, ordering publications, subscribing to newsletters, or contacting us for general enquiries:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li><strong>Personal Identification Data:</strong> Full name, age, city, state, postal address, and contact details.</li>
                <li><strong>Contact Information:</strong> Email address and phone/WhatsApp number.</li>
                <li><strong>Donation & Transaction Information:</strong> Contribution history, program preference, and transaction reference numbers.</li>
                <li><strong>Communications Data:</strong> Messages, feedback, and form enquiry submissions.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="font-editorial text-2xl font-bold text-[#2B201A] border-b border-[#E7D8C8] pb-2">
                2. Use of Information
              </h2>
              <p>
                Namo Bhagwate Vasudevaya Trust uses collected information strictly for legitimate charitable, spiritual, and administrative purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>Processing membership applications and issuing official membership certificates.</li>
                <li>Processing donation contributions and generating tax/payment receipts.</li>
                <li>Dispatching ordered agricultural books and spiritual publications.</li>
                <li>Sending important notifications regarding upcoming Shrimad Bhagwat Katha, Yoga camps, and Gurukul events.</li>
                <li>Responding to donor and devotee enquiries in a timely manner.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="font-editorial text-2xl font-bold text-[#2B201A] border-b border-[#E7D8C8] pb-2">
                3. Payment Information & Gateway Security
              </h2>
              <p>
                We do not store your confidential payment credentials (such as credit/debit card numbers, CVV, or banking passwords) on our servers. All online monetary transactions are securely processed through PCI-DSS compliant third-party payment gateways (such as Razorpay and BHIM UPI).
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-editorial text-2xl font-bold text-[#2B201A] border-b border-[#E7D8C8] pb-2">
                4. Information Sharing & Disclosure
              </h2>
              <p>
                Namo Bhagwate Vasudevaya Trust strictly respects your confidentiality. We <strong>never sell, trade, rent, or lease</strong> your personal information to commercial third parties. We may disclose personal data only:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>To trusted service providers (e.g., courier partners for book dispatch) who assist in Trust operations under strict confidentiality obligations.</li>
                <li>To comply with applicable Indian laws, legal processes, or government regulatory requirements.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="font-editorial text-2xl font-bold text-[#2B201A] border-b border-[#E7D8C8] pb-2">
                5. Cookies & Website Analytics
              </h2>
              <p>
                Our website may use essential cookies and basic session analytics to enhance site navigation, remember language preferences, and analyze aggregate traffic patterns. You can adjust your browser settings to decline non-essential cookies.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-editorial text-2xl font-bold text-[#2B201A] border-b border-[#E7D8C8] pb-2">
                6. Data Security Measures
              </h2>
              <p>
                We implement industry-standard physical, technical, and administrative security measures (including SSL encryption and secure server architecture) to protect your personal information against unauthorized access, alteration, or loss.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-editorial text-2xl font-bold text-[#2B201A] border-b border-[#E7D8C8] pb-2">
                7. External & Third-Party Links
              </h2>
              <p>
                Our website may contain links to external payment portals or social media pages. Namo Bhagwate Vasudevaya Trust is not responsible for the privacy practices or content of third-party websites. We encourage you to review their respective privacy policies.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-editorial text-2xl font-bold text-[#2B201A] border-b border-[#E7D8C8] pb-2">
                8. Changes to This Privacy Policy
              </h2>
              <p>
                We reserve the right to update this Privacy Policy periodically. Any modifications will be posted on this page with an updated revision date.
              </p>
            </div>

            <div className="p-6 bg-[#FFF9F2] rounded-2xl border border-[#E7D8C8] space-y-3">
              <h3 className="font-editorial text-xl font-bold text-[#2B201A]">
                9. Contact Details for Privacy Enquiries
              </h3>
              <p className="text-xs text-[#2B201A]/80">
                If you have any questions or requests regarding your personal data under this Privacy Policy, please contact our administrative office:
              </p>
              <div className="text-xs space-y-1 font-semibold text-[#2B201A]">
                <p><strong>Namo Bhagwate Vasudevaya Trust</strong></p>
                <p>Address: P6/10, 4th Floor, DLF Phase 2, Gurugram, Haryana 122008, India</p>
                <p>Email: help@namobhagwatevasudevaya.com | Phone: +91 88606 65000</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
