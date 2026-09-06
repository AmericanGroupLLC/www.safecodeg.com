/**
 * Terms of Service Page — /terms
 * Covers all 77 apps under American Group LLC & SafeCodeX.
 * Design: "Luminous Clarity" — Deep Navy + Electric Indigo + Saffron Gold
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Shield,
  Smartphone,
  ExternalLink,
  Mail,
  AlertTriangle,
} from "lucide-react";

const EFFECTIVE_DATE = "June 17, 2026";
const LAST_UPDATED = "June 17, 2026";
const CONTACT_EMAIL = "contact@safecodeg.com";
const COMPANY_NAME = "American Group LLC";
const COMPANY_STATE = "California";
const COMPANY_COUNTRY = "United States";

function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );
    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

const sections = [
  { id: "acceptance", title: "1. Acceptance of Terms" },
  { id: "services", title: "2. Description of Services" },
  { id: "accounts", title: "3. User Accounts" },
  { id: "license", title: "4. License Grant" },
  { id: "restrictions", title: "5. Prohibited Uses" },
  { id: "purchases", title: "6. In-App Purchases & Subscriptions" },
  { id: "ip", title: "7. Intellectual Property" },
  { id: "privacy", title: "8. Privacy" },
  { id: "disclaimer", title: "9. Disclaimers" },
  { id: "liability", title: "10. Limitation of Liability" },
  { id: "indemnification", title: "11. Indemnification" },
  { id: "termination", title: "12. Termination" },
  { id: "governing", title: "13. Governing Law" },
  { id: "changes", title: "14. Changes to Terms" },
  { id: "contact", title: "15. Contact Information" },
];

function TOCItem({
  id,
  title,
  active,
}: {
  id: string;
  title: string;
  active: boolean;
}) {
  return (
    <a
      href={`#${id}`}
      className="block text-xs py-1.5 px-3 rounded-lg transition-all duration-150"
      style={{
        color: active ? "oklch(0.52 0.22 270)" : "oklch(0.45 0.01 270)",
        background: active ? "oklch(0.52 0.22 270 / 0.08)" : "transparent",
        fontWeight: active ? "600" : "400",
      }}
    >
      {title}
    </a>
  );
}

export default function Terms() {
  useReveal();
  const [activeSection, setActiveSection] = useState("acceptance");

  useEffect(() => {
    const handleScroll = () => {
      const sectionEls = sections.map(s => document.getElementById(s.id));
      for (let i = sectionEls.length - 1; i >= 0; i--) {
        const el = sectionEls[i];
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{
        background: "#030408",
        color: "white",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <Navigation />

      {/* ── HERO ── */}
      <section
        className="relative pt-32 pb-16 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.12 0.04 270) 0%, oklch(0.18 0.06 270) 50%, oklch(0.14 0.05 240) 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(oklch(1 0 0 / 0.1) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="container relative z-10">
          <div className="flex items-center gap-2 text-xs mb-6">
            <Link
              href="/"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Home
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-indigo-400 font-medium">
              Terms of Service
            </span>
          </div>
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-6"
            style={{
              background: "oklch(0.52 0.22 270 / 0.2)",
              color: "oklch(0.78 0.18 270)",
              border: "1px solid oklch(0.52 0.22 270 / 0.3)",
            }}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Legal Agreement
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Terms of Service
          </h1>
          <p className="text-slate-300 max-w-2xl mb-6">
            These Terms govern your use of all applications and services
            published by <strong className="text-white">{COMPANY_NAME}</strong>{" "}
            and SafeCodeX Research Center Pvt. Ltd.
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-slate-400">
            <span>
              Effective:{" "}
              <strong className="text-slate-200">{EFFECTIVE_DATE}</strong>
            </span>
            <span>
              Last Updated:{" "}
              <strong className="text-slate-200">{LAST_UPDATED}</strong>
            </span>
            <span>
              Governing Law:{" "}
              <strong className="text-slate-200">
                {COMPANY_STATE}, {COMPANY_COUNTRY}
              </strong>
            </span>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <div className="container py-16">
        <div className="flex gap-12 max-w-6xl mx-auto">
          {/* Sticky TOC */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 p-4 rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-3">
                Contents
              </div>
              <nav className="space-y-0.5">
                {sections.map(s => (
                  <TOCItem
                    key={s.id}
                    id={s.id}
                    title={s.title}
                    active={activeSection === s.id}
                  />
                ))}
              </nav>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <Link
                  href="/privacy-policy"
                  className="flex items-center gap-2 text-xs text-indigo-600 hover:underline px-3"
                >
                  <Shield className="h-3 w-3" /> Privacy Policy
                </Link>
                <Link
                  href="/support"
                  className="flex items-center gap-2 text-xs text-indigo-600 hover:underline px-3 mt-2"
                >
                  <Smartphone className="h-3 w-3" /> Support Center
                </Link>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            <div
              className="prose prose-slate max-w-none"
              style={{ fontSize: "0.9rem", lineHeight: "1.75" }}
            >
              {/* Alert box */}
              <div className="not-prose mb-8 p-4 rounded-2xl border border-amber-200 bg-amber-50 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <strong>Please read these Terms carefully.</strong> By
                  downloading, installing, or using any app published by
                  American Group LLC, you agree to be bound by these Terms. If
                  you do not agree, do not use our apps.
                </div>
              </div>

              <section id="acceptance" className="mb-10 scroll-mt-24">
                <h2
                  className="text-xl font-bold text-white mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  1. Acceptance of Terms
                </h2>
                <p className="text-slate-300 mb-3">
                  By accessing or using any application, website, or service
                  ("Services") provided by <strong>{COMPANY_NAME}</strong>{" "}
                  ("Company," "we," "us," or "our") or its affiliate SafeCodeX
                  Research Center Pvt. Ltd., you agree to be bound by these
                  Terms of Service ("Terms") and our{" "}
                  <Link
                    href="/privacy-policy"
                    className="text-indigo-600 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
                <p className="text-slate-300 mb-3">
                  These Terms apply to all users of our Services, including
                  users who are also contributors of content, information, and
                  other materials or services. If you are using our Services on
                  behalf of an organization, you represent and warrant that you
                  have the authority to bind that organization to these Terms.
                </p>
                <p className="text-slate-300">
                  We reserve the right to update these Terms at any time.
                  Continued use of our Services after changes constitutes
                  acceptance of the updated Terms.
                </p>
              </section>

              <section id="services" className="mb-10 scroll-mt-24">
                <h2
                  className="text-xl font-bold text-white mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  2. Description of Services
                </h2>
                <p className="text-slate-300 mb-3">
                  American Group LLC publishes and operates a portfolio of{" "}
                  <strong>77 mobile applications</strong> across the following
                  verticals:
                </p>
                <ul className="list-none space-y-2 mb-4">
                  {[
                    "Health & Wellness",
                    "Education & Learning",
                    "Productivity & Business",
                    "Entertainment & Media",
                    "Smart Home & IoT",
                    "Finance & Lifestyle",
                  ].map(v => (
                    <li
                      key={v}
                      className="flex items-center gap-2 text-slate-300 text-sm"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                      {v}
                    </li>
                  ))}
                </ul>
                <p className="text-slate-300">
                  Our Services are available on iOS (Apple App Store) and
                  Android (Google Play Store). Features, availability, and
                  pricing may vary by platform and region. We reserve the right
                  to modify, suspend, or discontinue any Service at any time
                  without notice.
                </p>
              </section>

              <section id="accounts" className="mb-10 scroll-mt-24">
                <h2
                  className="text-xl font-bold text-white mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  3. User Accounts
                </h2>
                <p className="text-slate-300 mb-3">
                  Some of our Services require you to create an account. You
                  agree to:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-slate-300 text-sm mb-3">
                  <li>
                    Provide accurate, current, and complete information during
                    registration
                  </li>
                  <li>
                    Maintain the security of your password and account
                    credentials
                  </li>
                  <li>
                    Notify us immediately of any unauthorized use of your
                    account
                  </li>
                  <li>
                    Accept responsibility for all activities that occur under
                    your account
                  </li>
                  <li>Not share your account with any third party</li>
                </ul>
                <p className="text-slate-300">
                  We reserve the right to terminate accounts that violate these
                  Terms, contain false information, or have been inactive for an
                  extended period.
                </p>
              </section>

              <section id="license" className="mb-10 scroll-mt-24">
                <h2
                  className="text-xl font-bold text-white mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  4. License Grant
                </h2>
                <p className="text-slate-300 mb-3">
                  Subject to your compliance with these Terms, we grant you a
                  limited, non-exclusive, non-transferable, revocable license
                  to:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-slate-300 text-sm mb-3">
                  <li>
                    Download and install our apps on devices you own or control
                  </li>
                  <li>
                    Use the apps for your personal, non-commercial purposes
                  </li>
                  <li>Access and use the features provided within the apps</li>
                </ul>
                <p className="text-slate-300">
                  This license does not include the right to sublicense, sell,
                  resell, transfer, assign, or commercially exploit any part of
                  our Services. All rights not expressly granted are reserved by
                  the Company.
                </p>
              </section>

              <section id="restrictions" className="mb-10 scroll-mt-24">
                <h2
                  className="text-xl font-bold text-white mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  5. Prohibited Uses
                </h2>
                <p className="text-slate-300 mb-3">
                  You agree not to use our Services to:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-slate-300 text-sm">
                  <li>
                    Violate any applicable local, state, national, or
                    international law or regulation
                  </li>
                  <li>
                    Reverse engineer, decompile, disassemble, or attempt to
                    derive the source code of any app
                  </li>
                  <li>
                    Scrape, crawl, or use automated tools to access our Services
                  </li>
                  <li>Transmit any viruses, malware, or other harmful code</li>
                  <li>
                    Attempt to gain unauthorized access to any part of our
                    Services or systems
                  </li>
                  <li>
                    Use our Services to send unsolicited communications (spam)
                  </li>
                  <li>
                    Impersonate any person or entity or misrepresent your
                    affiliation
                  </li>
                  <li>
                    Interfere with or disrupt the integrity or performance of
                    our Services
                  </li>
                  <li>
                    Collect or harvest any personally identifiable information
                    from our Services
                  </li>
                  <li>
                    Use our Services for any commercial purpose without our
                    written consent
                  </li>
                </ul>
              </section>

              <section id="purchases" className="mb-10 scroll-mt-24">
                <h2
                  className="text-xl font-bold text-white mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  6. In-App Purchases & Subscriptions
                </h2>
                <p className="text-slate-300 mb-3">
                  Some of our apps offer in-app purchases, premium features, or
                  subscription plans. By making a purchase:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-slate-300 text-sm mb-3">
                  <li>
                    You authorize us to charge the applicable fees to your
                    payment method
                  </li>
                  <li>
                    Subscriptions automatically renew unless cancelled before
                    the renewal date
                  </li>
                  <li>
                    Prices are subject to change with notice provided in advance
                  </li>
                  <li>
                    All purchases are processed through Apple App Store or
                    Google Play Store
                  </li>
                  <li>
                    Refunds are governed by Apple's or Google's respective
                    refund policies
                  </li>
                </ul>
                <p className="text-slate-300">
                  To cancel a subscription: iOS — Settings → Apple ID →
                  Subscriptions. Android — Google Play → Subscriptions. Contact
                  us at{" "}
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="text-indigo-600 hover:underline"
                  >
                    {CONTACT_EMAIL}
                  </a>{" "}
                  for billing support.
                </p>
              </section>

              <section id="ip" className="mb-10 scroll-mt-24">
                <h2
                  className="text-xl font-bold text-white mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  7. Intellectual Property
                </h2>
                <p className="text-slate-300 mb-3">
                  All content, features, and functionality of our Services —
                  including but not limited to text, graphics, logos, icons,
                  images, audio clips, software, and the compilation thereof —
                  are the exclusive property of {COMPANY_NAME} or its licensors
                  and are protected by United States and international
                  copyright, trademark, patent, trade secret, and other
                  intellectual property laws.
                </p>
                <p className="text-slate-300">
                  Our trademarks and trade dress may not be used in connection
                  with any product or service without the prior written consent
                  of the Company. User-generated content remains the property of
                  the user, but by submitting content you grant us a worldwide,
                  royalty-free license to use, reproduce, and display such
                  content in connection with our Services.
                </p>
              </section>

              <section id="privacy" className="mb-10 scroll-mt-24">
                <h2
                  className="text-xl font-bold text-white mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  8. Privacy
                </h2>
                <p className="text-slate-300">
                  Your use of our Services is also governed by our{" "}
                  <Link
                    href="/privacy-policy"
                    className="text-indigo-600 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  , which is incorporated into these Terms by reference. Please
                  review our Privacy Policy, which describes how we collect,
                  use, and share information about you when you use our
                  Services. Our Privacy Policy URL for app store submissions is:{" "}
                  <code className="bg-white/[0.05] px-1.5 py-0.5 rounded text-xs">
                    https://safecodeg.com/privacy-policy
                  </code>
                </p>
              </section>

              <section id="disclaimer" className="mb-10 scroll-mt-24">
                <h2
                  className="text-xl font-bold text-white mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  9. Disclaimers
                </h2>
                <p className="text-slate-300 mb-3 uppercase text-xs font-semibold text-slate-400">
                  Important — Please Read
                </p>
                <p className="text-slate-300 mb-3">
                  OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
                  WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING
                  BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY,
                  FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                </p>
                <p className="text-slate-300 mb-3">
                  We do not warrant that our Services will be uninterrupted,
                  error-free, or free of viruses or other harmful components. We
                  do not warrant the accuracy, completeness, or usefulness of
                  any information provided through our Services.
                </p>
                <p className="text-slate-300">
                  Health-related apps are for informational purposes only and
                  are not a substitute for professional medical advice,
                  diagnosis, or treatment. Always seek the advice of a qualified
                  healthcare provider with any questions you may have regarding
                  a medical condition.
                </p>
              </section>

              <section id="liability" className="mb-10 scroll-mt-24">
                <h2
                  className="text-xl font-bold text-white mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  10. Limitation of Liability
                </h2>
                <p className="text-slate-300 mb-3">
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT
                  SHALL {COMPANY_NAME.toUpperCase()}, ITS AFFILIATES, DIRECTORS,
                  EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
                  SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT
                  LIMITED TO LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER
                  INTANGIBLE LOSSES.
                </p>
                <p className="text-slate-300">
                  Our total liability to you for any claims arising from or
                  related to these Terms or our Services shall not exceed the
                  amount you paid us in the twelve (12) months preceding the
                  claim, or $100 USD, whichever is greater.
                </p>
              </section>

              <section id="indemnification" className="mb-10 scroll-mt-24">
                <h2
                  className="text-xl font-bold text-white mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  11. Indemnification
                </h2>
                <p className="text-slate-300">
                  You agree to defend, indemnify, and hold harmless{" "}
                  {COMPANY_NAME} and its affiliates, officers, directors,
                  employees, and agents from and against any claims,
                  liabilities, damages, judgments, awards, losses, costs,
                  expenses, or fees (including reasonable attorneys' fees)
                  arising out of or relating to your violation of these Terms or
                  your use of our Services.
                </p>
              </section>

              <section id="termination" className="mb-10 scroll-mt-24">
                <h2
                  className="text-xl font-bold text-white mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  12. Termination
                </h2>
                <p className="text-slate-300 mb-3">
                  We may terminate or suspend your access to our Services
                  immediately, without prior notice or liability, for any
                  reason, including if you breach these Terms. Upon termination,
                  your right to use our Services will immediately cease.
                </p>
                <p className="text-slate-300">
                  You may terminate your account at any time by contacting us at{" "}
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="text-indigo-600 hover:underline"
                  >
                    {CONTACT_EMAIL}
                  </a>{" "}
                  or by using the account deletion feature within the app.
                  Termination does not entitle you to a refund of any fees paid.
                </p>
              </section>

              <section id="governing" className="mb-10 scroll-mt-24">
                <h2
                  className="text-xl font-bold text-white mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  13. Governing Law
                </h2>
                <p className="text-slate-300 mb-3">
                  These Terms shall be governed by and construed in accordance
                  with the laws of the State of {COMPANY_STATE},{" "}
                  {COMPANY_COUNTRY}, without regard to its conflict of law
                  provisions.
                </p>
                <p className="text-slate-300">
                  Any disputes arising under these Terms shall be subject to the
                  exclusive jurisdiction of the state and federal courts located
                  in Santa Clara County, California. If you are a consumer in
                  the European Union, you may also have rights under the laws of
                  your country of residence.
                </p>
              </section>

              <section id="changes" className="mb-10 scroll-mt-24">
                <h2
                  className="text-xl font-bold text-white mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  14. Changes to Terms
                </h2>
                <p className="text-slate-300 mb-3">
                  We reserve the right to modify these Terms at any time. We
                  will notify you of significant changes by:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-slate-300 text-sm mb-3">
                  <li>
                    Posting the updated Terms on this page with a new "Last
                    Updated" date
                  </li>
                  <li>
                    Sending a push notification through the app (for material
                    changes)
                  </li>
                  <li>Displaying an in-app notice upon next launch</li>
                  <li>
                    Emailing registered users (where we have your email address)
                  </li>
                </ul>
                <p className="text-slate-300">
                  Your continued use of our Services after the effective date of
                  the revised Terms constitutes your acceptance of the changes.
                </p>
              </section>

              <section id="contact" className="mb-10 scroll-mt-24">
                <h2
                  className="text-xl font-bold text-white mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  15. Contact Information
                </h2>
                <p className="text-slate-300 mb-4">
                  If you have any questions about these Terms of Service, please
                  contact us:
                </p>
                <div className="not-prose grid md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.03]">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">🇺🇸</span>
                      <div className="font-bold text-white text-sm">
                        {COMPANY_NAME}
                      </div>
                    </div>
                    <div className="space-y-1.5 text-sm text-slate-300">
                      <div>Santa Clara, California, USA</div>
                      <a
                        href={`mailto:${CONTACT_EMAIL}`}
                        className="flex items-center gap-2 text-indigo-600 hover:underline"
                      >
                        <Mail className="h-3.5 w-3.5" /> {CONTACT_EMAIL}
                      </a>
                      <div className="font-mono text-xs">+1 (510) 458-9059</div>
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.03]">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">🇮🇳</span>
                      <div className="font-bold text-white text-sm">
                        SafeCodeX Research Center Pvt. Ltd.
                      </div>
                    </div>
                    <div className="space-y-1.5 text-sm text-slate-300">
                      <div>Hyderabad, India</div>
                      <a
                        href={`mailto:${CONTACT_EMAIL}`}
                        className="flex items-center gap-2 text-indigo-600 hover:underline"
                      >
                        <Mail className="h-3.5 w-3.5" /> {CONTACT_EMAIL}
                      </a>
                      <div className="font-mono text-xs">+91 74168 66689</div>
                    </div>
                  </div>
                </div>

                {/* App Store URL reference box */}
                <div className="not-prose mt-6 p-5 rounded-2xl border border-indigo-500/20 bg-indigo-50">
                  <div className="font-bold text-indigo-900 text-sm mb-3 flex items-center gap-2">
                    <Smartphone className="h-4 w-4" /> Official App Store URLs
                  </div>
                  <div className="space-y-2">
                    {[
                      {
                        label: "Terms of Service",
                        url: "https://safecodeg.com/terms",
                      },
                      {
                        label: "Privacy Policy",
                        url: "https://safecodeg.com/privacy-policy",
                      },
                      {
                        label: "Support URL",
                        url: "https://safecodeg.com/support",
                      },
                      {
                        label: "Marketing Website",
                        url: "https://safecodeg.com",
                      },
                    ].map(({ label, url }) => (
                      <div
                        key={url}
                        className="flex items-center gap-3 text-xs"
                      >
                        <span className="text-indigo-600 font-semibold w-36 shrink-0">
                          {label}:
                        </span>
                        <code className="text-indigo-300 bg-white/[0.08] px-2 py-0.5 rounded font-mono border border-indigo-500/20">
                          {url}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
