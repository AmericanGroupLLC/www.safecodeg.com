/**
 * Support Page — /support
 * Required by Apple App Store as a working Support URL.
 * Covers all 77 apps under American Group LLC & SafeCodeX.
 * Design: "Luminous Clarity" — Deep Navy + Electric Indigo + Saffron Gold
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  Mail,
  Phone,
  MessageCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Shield,
  Zap,
  BookOpen,
  Bug,
  CreditCard,
  Download,
  CheckCircle,
  ExternalLink,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

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

const SUPPORT_EMAIL = "contact@safecodeg.com";
const USA_PHONE = "+1 (510) 458-9059";
const INDIA_PHONE = "+91 74168 66689";

const categories = [
  {
    icon: Smartphone,
    color: "oklch(0.52 0.22 270)",
    emoji: "📱",
    title: "App Installation & Setup",
    desc: "Help with downloading, installing, and first-time setup of any AGL app.",
    topics: [
      "App won't install or download",
      "Account creation issues",
      "Login and authentication problems",
      "App permissions setup",
      "Device compatibility questions",
    ],
  },
  {
    icon: Bug,
    color: "oklch(0.55 0.18 30)",
    emoji: "🐛",
    title: "Bug Reports & Technical Issues",
    desc: "Report crashes, errors, or unexpected behavior in any of our apps.",
    topics: [
      "App crashes or freezes",
      "Features not working as expected",
      "Data sync issues",
      "Performance problems",
      "UI display errors",
    ],
  },
  {
    icon: Shield,
    color: "oklch(0.72 0.14 165)",
    emoji: "🔐",
    title: "Privacy & Data",
    desc: "Questions about your data, privacy settings, and deletion requests.",
    topics: [
      "Data deletion requests",
      "Privacy settings help",
      "GDPR / CCPA rights",
      "Data export requests",
      "Account deletion",
    ],
  },
  {
    icon: CreditCard,
    color: "oklch(0.78 0.18 75)",
    emoji: "💳",
    title: "Billing & Subscriptions",
    desc: "Help with in-app purchases, subscriptions, and refund requests.",
    topics: [
      "In-app purchase issues",
      "Subscription management",
      "Refund requests",
      "Restore purchases",
      "Payment method problems",
    ],
  },
  {
    icon: Download,
    color: "oklch(0.65 0.16 310)",
    emoji: "⬇️",
    title: "Updates & Compatibility",
    desc: "Issues with app updates, OS compatibility, and version-specific problems.",
    topics: [
      "App update not available",
      "OS version compatibility",
      "Feature changes after update",
      "Rollback requests",
      "Beta testing access",
    ],
  },
  {
    icon: BookOpen,
    color: "oklch(0.60 0.20 200)",
    emoji: "📖",
    title: "How-To & Guides",
    desc: "Step-by-step guidance on using features across all our applications.",
    topics: [
      "Feature walkthroughs",
      "Video tutorials",
      "User manuals",
      "Best practices",
      "Tips and tricks",
    ],
  },
];

const faqs = [
  {
    q: "How do I request deletion of my account and data?",
    a: "Email contact@safecodeg.com with subject line 'Data Deletion Request', including your name, email address, and the app name. We process all deletion requests within 30 days. You can also use the in-app settings menu under Account → Delete Account in supported apps.",
  },
  {
    q: "Which apps does American Group LLC publish?",
    a: "American Group LLC publishes 77 applications across 6 verticals: Health & Wellness, Education & Learning, Productivity & Business, Entertainment & Media, Smart Home & IoT, and Finance & Lifestyle. All apps are developed in partnership with SafeCodeX Research Center in Hyderabad, India.",
  },
  {
    q: "How do I restore in-app purchases after reinstalling?",
    a: "Open the app → go to Settings or Account → tap 'Restore Purchases'. Make sure you are signed in with the same Apple ID or Google account used for the original purchase. If the issue persists, contact us at contact@safecodeg.com with your order ID.",
  },
  {
    q: "My app is crashing. What should I do?",
    a: "First, try: (1) Force-close and reopen the app, (2) Restart your device, (3) Check for app updates in the App Store or Google Play, (4) Uninstall and reinstall the app. If the issue continues, email contact@safecodeg.com with your device model, OS version, and a description of what triggers the crash.",
  },
  {
    q: "How do I opt out of push notifications?",
    a: "On iOS: Settings → Notifications → [App Name] → toggle off. On Android: Settings → Apps → [App Name] → Notifications → toggle off. You can also manage notification preferences within the app under Settings → Notifications.",
  },
  {
    q: "Is my health or personal data shared with third parties?",
    a: "No. We do not sell your personal data to third parties. Data may be shared only with service providers who help us operate our apps (e.g., cloud storage, analytics) under strict data processing agreements. See our full Privacy Policy at safecodeg.com/privacy-policy for complete details.",
  },
  {
    q: "How long does it take to get a support response?",
    a: "We aim to respond to all support emails within 24–48 business hours. For urgent issues (app completely non-functional), we prioritize responses within 12 hours. Our support team operates Monday–Friday, 9 AM–6 PM IST and 9 AM–5 PM PST.",
  },
  {
    q: "Do your apps work offline?",
    a: "Many of our apps support offline functionality for core features. Sync, cloud backup, and real-time features require an internet connection. Check the specific app's description on the App Store or Google Play for offline capability details.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border border-slate-200 rounded-2xl overflow-hidden transition-all duration-200"
      style={{ background: open ? "oklch(0.985 0.003 270)" : "white" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="font-semibold text-white text-sm leading-snug">
          {q}
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-indigo-500 shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-sm text-slate-300 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function Support() {
  useReveal();

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
        className="relative pt-32 pb-20 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.12 0.04 270) 0%, oklch(0.18 0.06 270) 50%, oklch(0.14 0.05 240) 100%)",
        }}
      >
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(oklch(1 0 0 / 0.1) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="container relative z-10 text-center">
          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 text-xs mb-6">
            <Link
              href="/"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Home
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-indigo-400 font-medium">Support</span>
          </div>

          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-6"
            style={{
              background: "oklch(0.52 0.22 270 / 0.2)",
              color: "oklch(0.78 0.18 270)",
              border: "1px solid oklch(0.52 0.22 270 / 0.3)",
            }}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            App Support Center
          </div>

          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            How Can We Help You?
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10">
            Support for all <strong className="text-white">77 apps</strong>{" "}
            published by American Group LLC on the App Store and Google Play.
            We're here to help.
          </p>

          {/* Quick contact bar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-105"
              style={{
                background: "oklch(0.52 0.22 270)",
                boxShadow: "0 4px 20px oklch(0.52 0.22 270 / 0.4)",
              }}
            >
              <Mail className="h-4 w-4" />
              {SUPPORT_EMAIL}
            </a>
            <a
              href={`tel:${USA_PHONE.replace(/\s|\(|\)|-/g, "")}`}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105"
              style={{
                background: "oklch(1 0 0 / 0.1)",
                color: "white",
                border: "1px solid oklch(1 0 0 / 0.2)",
              }}
            >
              <Phone className="h-4 w-4" />
              {USA_PHONE}
            </a>
          </div>
        </div>
      </section>

      {/* ── RESPONSE TIME BADGES ── */}
      <section className="py-8 border-b border-white/10">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: Clock,
                label: "Email Response",
                value: "24–48 hrs",
                color: "oklch(0.52 0.22 270)",
              },
              {
                icon: Zap,
                label: "Urgent Issues",
                value: "< 12 hrs",
                color: "oklch(0.78 0.18 75)",
              },
              {
                icon: CheckCircle,
                label: "Apps Supported",
                value: "77 Apps",
                color: "oklch(0.72 0.14 165)",
              },
              {
                icon: MessageCircle,
                label: "Support Hours",
                value: "Mon–Fri",
                color: "oklch(0.65 0.16 310)",
              },
            ].map(({ icon: Icon, label, value, color }) => (
              <div
                key={label}
                className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.03]"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${color}20` }}
                >
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <div>
                  <div className="text-xs text-slate-400">{label}</div>
                  <div className="font-bold text-white text-sm">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUPPORT CATEGORIES ── */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12 reveal">
            <h2
              className="text-3xl font-bold text-white mb-3"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              What Do You Need Help With?
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Select a category below or email us directly — we support all 77
              apps across iOS and Android.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(cat => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.title}
                  className="reveal group p-6 rounded-2xl border border-white/10 bg-white/[0.05] hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  onClick={() =>
                    (window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(cat.title + " - Support Request")}`)
                  }
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-xl"
                      style={{ background: `${cat.color}15` }}
                    >
                      {cat.emoji}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm mb-1">
                        {cat.title}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {cat.desc}
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-1.5">
                    {cat.topics.map(t => (
                      <li
                        key={t}
                        className="flex items-center gap-2 text-xs text-slate-300"
                      >
                        <div
                          className="w-1 h-1 rounded-full shrink-0"
                          style={{ background: cat.color }}
                        />
                        {t}
                      </li>
                    ))}
                  </ul>
                  <div
                    className="mt-4 flex items-center gap-1 text-xs font-semibold"
                    style={{ color: cat.color }}
                  >
                    Get Help <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 bg-white/[0.03]">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12 reveal">
              <h2
                className="text-3xl font-bold text-white mb-3"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Frequently Asked Questions
              </h2>
              <p className="text-slate-400">
                Quick answers to the most common support questions.
              </p>
            </div>
            <div className="space-y-3 reveal">
              {faqs.map(faq => (
                <FAQItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT SECTION ── */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 reveal">
              <h2
                className="text-3xl font-bold text-white mb-3"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Still Need Help?
              </h2>
              <p className="text-slate-400">
                Our team is available across both offices. Reach out and we'll
                get back to you promptly.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 reveal">
              {/* USA Office */}
              <div
                className="p-8 rounded-3xl border border-white/10 bg-white/[0.05]"
                style={{ boxShadow: "0 8px 40px oklch(0.52 0.22 270 / 0.06)" }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">🇺🇸</span>
                  <div>
                    <div className="font-bold text-white">
                      American Group LLC
                    </div>
                    <div className="text-xs text-slate-400">
                      Santa Clara, California, USA
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-indigo-500/10 transition-colors group"
                  >
                    <Mail className="h-4 w-4 text-indigo-500 shrink-0" />
                    <span className="text-sm text-slate-200 group-hover:text-indigo-700">
                      {SUPPORT_EMAIL}
                    </span>
                  </a>
                  <a
                    href={`tel:+15104589059`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-indigo-500/10 transition-colors group"
                  >
                    <Phone className="h-4 w-4 text-indigo-500 shrink-0" />
                    <span className="text-sm text-slate-200 group-hover:text-indigo-700">
                      {USA_PHONE}
                    </span>
                  </a>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
                    <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="text-sm text-slate-400">
                      Mon–Fri, 9 AM–5 PM PST
                    </span>
                  </div>
                </div>
              </div>

              {/* India Office */}
              <div
                className="p-8 rounded-3xl border border-white/10 bg-white/[0.05]"
                style={{ boxShadow: "0 8px 40px oklch(0.78 0.18 75 / 0.06)" }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">🇮🇳</span>
                  <div>
                    <div className="font-bold text-white">
                      SafeCodeX Research Center
                    </div>
                    <div className="text-xs text-slate-400">
                      Hyderabad, India
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-amber-500/10 transition-colors group"
                  >
                    <Mail className="h-4 w-4 text-amber-500 shrink-0" />
                    <span className="text-sm text-slate-200 group-hover:text-amber-700">
                      {SUPPORT_EMAIL}
                    </span>
                  </a>
                  <a
                    href={`tel:+917416866689`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-amber-500/10 transition-colors group"
                  >
                    <Phone className="h-4 w-4 text-amber-500 shrink-0" />
                    <span className="text-sm text-slate-200 group-hover:text-amber-700">
                      {INDIA_PHONE}
                    </span>
                  </a>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
                    <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="text-sm text-slate-400">
                      Mon–Fri, 9 AM–6 PM IST
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div className="mt-8 p-6 rounded-2xl bg-white/[0.03] reveal">
              <div className="text-sm font-semibold text-slate-200 mb-4">
                Related Pages
              </div>
              <div className="flex flex-wrap gap-3">
                {[
                  {
                    label: "Privacy Policy",
                    href: "/privacy-policy",
                    icon: Shield,
                  },
                  { label: "Terms of Service", href: "/terms", icon: BookOpen },
                  { label: "Contact Us", href: "/contact", icon: Mail },
                  { label: "About Us", href: "/about", icon: ExternalLink },
                ].map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-300 hover:text-indigo-600 hover:border-indigo-200 transition-all"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── APP STORE URLS BOX ── */}
      <section className="py-12 border-t border-white/10">
        <div className="container">
          <div className="max-w-3xl mx-auto p-6 rounded-2xl border border-indigo-100 bg-indigo-50 reveal">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                <Smartphone className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <div className="font-bold text-indigo-900 mb-2">
                  Official App Store URLs for Developers
                </div>
                <div className="space-y-1.5 text-sm">
                  {[
                    {
                      label: "Support URL",
                      url: "https://www.safecodeg.com/support",
                    },
                    {
                      label: "Privacy Policy URL",
                      url: "https://www.safecodeg.com/privacy-policy",
                    },
                    {
                      label: "Terms of Service URL",
                      url: "https://www.safecodeg.com/terms",
                    },
                    {
                      label: "Marketing Website",
                      url: "https://www.safecodeg.com",
                    },
                  ].map(({ label, url }) => (
                    <div key={url} className="flex items-center gap-3">
                      <span className="text-indigo-500 font-medium w-40 shrink-0">
                        {label}:
                      </span>
                      <code className="text-indigo-800 bg-white px-2 py-0.5 rounded text-xs font-mono border border-indigo-100">
                        {url}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
