/**
 * Privacy Policy Page — American Group LLC & SafeCodeX Research Center
 * "Luminous Clarity" Design System
 *
 * Comprehensive single-page Privacy Policy satisfying:
 * - Google Play Store requirements
 * - Apple App Store requirements
 * - GDPR / CCPA / COPPA compliance language
 * - Covers all 77 products across 6 verticals
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  Shield, ChevronRight, ExternalLink, Mail, MapPin, Calendar,
  Eye, Lock, Database, Smartphone, Globe, Bell, Users, Trash2,
  RefreshCw, FileText, AlertTriangle, CheckCircle, Baby,
} from "lucide-react";

const LAST_UPDATED = "June 17, 2026";
const EFFECTIVE_DATE = "June 17, 2026";
const CONTACT_EMAIL = "contact@safecodeg.com";
const PRIVACY_EMAIL = "contact@safecodeg.com";
const COMPANY_NAME = "American Group LLC";
const INDIA_ENTITY = "SafeCodeX Research Center Pvt. Ltd.";
const HQ_ADDRESS = "Santa Clara, California, USA";

// Table of contents sections
const sections = [
  { id: "overview", label: "Overview", icon: FileText },
  { id: "information-collected", label: "Information We Collect", icon: Database },
  { id: "how-we-use", label: "How We Use Information", icon: Eye },
  { id: "sharing", label: "Information Sharing", icon: Users },
  { id: "data-storage", label: "Data Storage & Security", icon: Lock },
  { id: "permissions", label: "App Permissions", icon: Smartphone },
  { id: "third-party", label: "Third-Party Services", icon: Globe },
  { id: "children", label: "Children's Privacy", icon: Baby },
  { id: "your-rights", label: "Your Rights & Choices", icon: CheckCircle },
  { id: "notifications", label: "Push Notifications", icon: Bell },
  { id: "data-retention", label: "Data Retention & Deletion", icon: Trash2 },
  { id: "updates", label: "Policy Updates", icon: RefreshCw },
  { id: "contact", label: "Contact Us", icon: Mail },
];

function SectionAnchor({ id }: { id: string }) {
  return <span id={id} className="block" style={{ marginTop: "-80px", paddingTop: "80px" }} />;
}

function SectionTitle({ icon: Icon, title, id }: { icon: React.ElementType; title: string; id: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: "oklch(0.52 0.22 270 / 0.1)" }}>
        <Icon className="h-4.5 w-4.5" style={{ color: "oklch(0.52 0.22 270)" }} />
      </div>
      <h2 id={id} className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
        {title}
      </h2>
    </div>
  );
}

function InfoBox({ type, children }: { type: "note" | "warning" | "important"; children: React.ReactNode }) {
  const styles = {
    note: { bg: "oklch(0.97 0.005 255)", border: "oklch(0.52 0.22 270 / 0.3)", icon: <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "oklch(0.52 0.22 270)" }} /> },
    warning: { bg: "oklch(0.98 0.01 75)", border: "oklch(0.78 0.18 75 / 0.4)", icon: <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "oklch(0.65 0.16 75)" }} /> },
    important: { bg: "oklch(0.98 0.005 30)", border: "oklch(0.55 0.18 30 / 0.3)", icon: <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "oklch(0.55 0.18 30)" }} /> },
  };
  const s = styles[type];
  return (
    <div className="flex gap-3 p-4 rounded-xl mb-4 text-sm leading-relaxed"
      style={{ background: s.bg, border: `1px solid ${s.border}` }}>
      {s.icon}
      <div className="text-slate-700">{children}</div>
    </div>
  );
}

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    window.scrollTo(0, 0);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id);
        });
      },
      { threshold: 0.3, rootMargin: "-80px 0px -60% 0px" }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero */}
      <section className="relative pt-24 pb-12 overflow-hidden" style={{ background: "oklch(0.14 0.04 255)" }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, oklch(0.14 0.04 255) 50%, oklch(0.20 0.08 270) 100%)" }} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/40 text-xs font-mono mb-6">
            <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/70">Privacy Policy</span>
          </div>
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "oklch(0.52 0.22 270 / 0.2)", border: "1px solid oklch(0.52 0.22 270 / 0.3)" }}>
              <Shield className="h-7 w-7" style={{ color: "oklch(0.75 0.15 270)" }} />
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                Privacy Policy
              </h1>
              <div className="flex flex-wrap gap-4 text-xs font-mono text-white/50">
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Effective: {EFFECTIVE_DATE}</span>
                <span className="flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5" /> Last Updated: {LAST_UPDATED}</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {HQ_ADDRESS}</span>
              </div>
            </div>
          </div>
          {/* App store compliance badges */}
          <div className="flex flex-wrap gap-3 mt-6">
            {["Google Play Store Compliant", "Apple App Store Compliant", "GDPR Ready", "CCPA Ready", "COPPA Compliant"].map((badge) => (
              <span key={badge} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold"
                style={{ background: "oklch(0.52 0.22 270 / 0.15)", color: "oklch(0.75 0.15 270)", border: "1px solid oklch(0.52 0.22 270 / 0.25)" }}>
                <CheckCircle className="h-3 w-3" /> {badge}
              </span>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 40L1440 0V40H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Main content: sidebar TOC + article */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-10 items-start">

          {/* Sticky Table of Contents */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-24">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400 mb-4">Contents</div>
              <nav className="space-y-1">
                {sections.map((s) => {
                  const Icon = s.icon;
                  const isActive = activeSection === s.id;
                  return (
                    <a key={s.id} href={`#${s.id}`}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all"
                      style={{
                        background: isActive ? "oklch(0.52 0.22 270 / 0.1)" : "transparent",
                        color: isActive ? "oklch(0.52 0.22 270)" : "oklch(0.45 0.01 286)",
                        fontWeight: isActive ? 600 : 400,
                      }}>
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      {s.label}
                    </a>
                  );
                })}
              </nav>
              <div className="mt-5 pt-4 border-t border-slate-200">
                <a href={`mailto:${PRIVACY_EMAIL}`}
                  className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-700 transition-colors">
                  <Mail className="h-3.5 w-3.5" />
                  {PRIVACY_EMAIL}
                </a>
              </div>
            </div>
          </aside>

          {/* Article */}
          <article className="flex-1 min-w-0 space-y-12">

            {/* ── 1. Overview ── */}
            <section>
              <SectionAnchor id="overview" />
              <SectionTitle icon={FileText} title="Overview" id="overview-heading" />
              <p className="text-slate-600 leading-relaxed mb-4">
                This Privacy Policy describes how <strong className="text-slate-900">{COMPANY_NAME}</strong> (also operating as <strong className="text-slate-900">{INDIA_ENTITY}</strong>, our India engineering office) collects, uses, stores, and shares information when you use any of our mobile applications, web applications, software products, or services (collectively, the <strong>"Services"</strong>).
              </p>
              <p className="text-slate-600 leading-relaxed mb-4">
                This policy applies to all <strong className="text-slate-900">77 products</strong> published under the American Group LLC and SafeCodeX Research Center brands across six verticals: Enterprise AI & DevTools, Consumer Mobile & Lifestyle, FinTech & E-Commerce, CyberSecurity & Infrastructure, Spatial & Industry SaaS, and IoT & Hardware.
              </p>
              <InfoBox type="important">
                <strong>By downloading, installing, or using any of our applications, you agree to the collection and use of information in accordance with this policy.</strong> If you do not agree, please do not use our Services.
              </InfoBox>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr style={{ background: "oklch(0.97 0.005 255)" }}>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700 border border-slate-100 rounded-tl-lg">Entity</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700 border border-slate-100">Role</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700 border border-slate-100 rounded-tr-lg">Jurisdiction</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-3 border border-slate-100 text-slate-700 font-medium">American Group LLC</td>
                      <td className="px-4 py-3 border border-slate-100 text-slate-600">Data Controller / Parent Organization</td>
                      <td className="px-4 py-3 border border-slate-100 text-slate-600">Santa Clara, California, USA</td>
                    </tr>
                    <tr style={{ background: "oklch(0.99 0 0)" }}>
                      <td className="px-4 py-3 border border-slate-100 text-slate-700 font-medium">SafeCodeX Research Center Pvt. Ltd.</td>
                      <td className="px-4 py-3 border border-slate-100 text-slate-600">Data Processor / India Engineering Office</td>
                      <td className="px-4 py-3 border border-slate-100 text-slate-600">India</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── 2. Information We Collect ── */}
            <section>
              <SectionAnchor id="information-collected" />
              <SectionTitle icon={Database} title="Information We Collect" id="information-collected-heading" />
              <p className="text-slate-600 leading-relaxed mb-6">
                The specific information we collect depends on which of our Services you use. We collect information in three ways: information you provide directly, information collected automatically, and information from third-party sources.
              </p>

              <h3 className="text-lg font-bold text-slate-900 mb-3">2.1 Information You Provide Directly</h3>
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr style={{ background: "oklch(0.97 0.005 255)" }}>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700 border border-slate-100">Data Type</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700 border border-slate-100">Examples</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700 border border-slate-100">When Collected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Account Information", "Name, email address, username, password (hashed)", "Registration / Sign-up"],
                      ["Profile Data", "Profile photo, bio, preferences, settings", "Profile setup"],
                      ["Payment Information", "Billing address, last 4 digits of card (via Stripe/payment processor)", "In-app purchases"],
                      ["Health & Fitness Data", "Steps, heart rate, sleep, workouts (health apps only)", "Active use of health features"],
                      ["Communications", "Support messages, feedback, survey responses", "Customer support"],
                      ["User-Generated Content", "Notes, photos, documents you upload or create", "Active use of content features"],
                      ["Device Pairing Data", "Bluetooth device IDs, firmware versions (IoT/hardware apps)", "Device pairing"],
                    ].map(([type, examples, when], i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "white" : "oklch(0.99 0 0)" }}>
                        <td className="px-4 py-3 border border-slate-100 font-medium text-slate-700">{type}</td>
                        <td className="px-4 py-3 border border-slate-100 text-slate-600">{examples}</td>
                        <td className="px-4 py-3 border border-slate-100 text-slate-500 text-xs">{when}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-3">2.2 Information Collected Automatically</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                When you use our apps, we automatically collect certain technical information to ensure the Services function correctly and to improve performance:
              </p>
              <ul className="space-y-2 mb-6">
                {[
                  "Device identifiers (device model, OS version, unique device ID)",
                  "App usage data (features used, session duration, crash reports)",
                  "Log data (IP address, timestamps, error logs)",
                  "Location data (only when you grant permission; used for location-based features)",
                  "Sensor data (accelerometer, gyroscope — for fitness and IoT apps only)",
                  "Network information (Wi-Fi or cellular connection type)",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <span className="h-1.5 w-1.5 rounded-full mt-2 shrink-0" style={{ background: "oklch(0.52 0.22 270)" }} />
                    {item}
                  </li>
                ))}
              </ul>

              <h3 className="text-lg font-bold text-slate-900 mb-3">2.3 Information from Third Parties</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                We may receive information about you from third-party services when you choose to connect them to our apps (e.g., Google Sign-In, Apple Sign-In, social media accounts, or health platforms such as Apple HealthKit or Google Fit).
              </p>
              <InfoBox type="note">
                We do <strong>not</strong> sell your personal information to third parties. We do not purchase personal data from data brokers.
              </InfoBox>
            </section>

            {/* ── 3. How We Use Information ── */}
            <section>
              <SectionAnchor id="how-we-use" />
              <SectionTitle icon={Eye} title="How We Use Your Information" id="how-we-use-heading" />
              <p className="text-slate-600 leading-relaxed mb-5">
                We use the information we collect for the following purposes:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {[
                  { title: "Provide & Operate Services", desc: "Deliver app functionality, process transactions, authenticate users, and maintain accounts.", color: "oklch(0.52 0.22 270)" },
                  { title: "Personalization", desc: "Customize your experience, remember preferences, and deliver relevant content and features.", color: "oklch(0.72 0.14 165)" },
                  { title: "Analytics & Improvement", desc: "Understand how our apps are used, diagnose bugs, and improve performance and features.", color: "oklch(0.78 0.18 75)" },
                  { title: "Security & Fraud Prevention", desc: "Detect, investigate, and prevent fraudulent transactions and other illegal activities.", color: "oklch(0.55 0.18 30)" },
                  { title: "Customer Support", desc: "Respond to your requests, troubleshoot problems, and provide technical assistance.", color: "oklch(0.65 0.16 310)" },
                  { title: "Legal Compliance", desc: "Comply with applicable laws, regulations, and legal processes, including app store policies.", color: "oklch(0.60 0.15 200)" },
                  { title: "Communications", desc: "Send service-related notices, security alerts, and (with consent) promotional messages.", color: "oklch(0.52 0.22 270)" },
                  { title: "Research & Development", desc: "Conduct internal research to develop new features, products, and services.", color: "oklch(0.72 0.14 165)" },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: item.color }} />
                      <span className="font-semibold text-slate-900 text-sm">{item.title}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
              <InfoBox type="note">
                We process your data only when we have a lawful basis to do so — including your consent, performance of a contract, our legitimate interests, or compliance with a legal obligation.
              </InfoBox>
            </section>

            {/* ── 4. Information Sharing ── */}
            <section>
              <SectionAnchor id="sharing" />
              <SectionTitle icon={Users} title="Information Sharing & Disclosure" id="sharing-heading" />
              <p className="text-slate-600 leading-relaxed mb-5">
                We do not sell, rent, or trade your personal information. We may share your information only in the following limited circumstances:
              </p>
              <div className="space-y-4 mb-6">
                {[
                  {
                    title: "Service Providers",
                    desc: "We share data with trusted third-party vendors who assist us in operating our apps (e.g., cloud hosting, analytics, payment processing, customer support). These providers are contractually bound to use your data only as directed by us and in accordance with this policy.",
                  },
                  {
                    title: "Business Transfers",
                    desc: "If American Group LLC is involved in a merger, acquisition, or asset sale, your information may be transferred as part of that transaction. We will notify you before your information is transferred and becomes subject to a different privacy policy.",
                  },
                  {
                    title: "Legal Requirements",
                    desc: "We may disclose your information if required to do so by law, court order, or governmental authority, or when we believe disclosure is necessary to protect our rights, your safety, or the safety of others.",
                  },
                  {
                    title: "With Your Consent",
                    desc: "We may share your information with third parties when you explicitly consent to such sharing (e.g., connecting a third-party health platform or social media account).",
                  },
                  {
                    title: "Aggregated / Anonymized Data",
                    desc: "We may share aggregated, de-identified data that cannot reasonably be used to identify you with partners, researchers, or the public for analytical or research purposes.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl border border-slate-100">
                    <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs text-white"
                      style={{ background: "oklch(0.52 0.22 270)" }}>{i + 1}</div>
                    <div>
                      <div className="font-semibold text-slate-900 mb-1 text-sm">{item.title}</div>
                      <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── 5. Data Storage & Security ── */}
            <section>
              <SectionAnchor id="data-storage" />
              <SectionTitle icon={Lock} title="Data Storage & Security" id="data-storage-heading" />
              <p className="text-slate-600 leading-relaxed mb-4">
                Your data is stored on secure servers operated by us or our trusted cloud service providers (including but not limited to Amazon Web Services, Google Cloud Platform, and Microsoft Azure). Data may be processed and stored in the United States and/or India, depending on the service.
              </p>
              <p className="text-slate-600 leading-relaxed mb-5">
                We implement industry-standard security measures to protect your information, including:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
                {[
                  "TLS/SSL encryption in transit",
                  "AES-256 encryption at rest",
                  "Hashed & salted passwords (bcrypt)",
                  "Role-based access controls",
                  "Regular security audits",
                  "Vulnerability disclosure program",
                  "Two-factor authentication support",
                  "Automated threat monitoring",
                  "SOC 2-aligned practices",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-100 text-sm text-slate-700">
                    <CheckCircle className="h-3.5 w-3.5 shrink-0" style={{ color: "oklch(0.52 0.22 270)" }} />
                    {item}
                  </div>
                ))}
              </div>
              <InfoBox type="warning">
                No method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
              </InfoBox>
            </section>

            {/* ── 6. App Permissions ── */}
            <section>
              <SectionAnchor id="permissions" />
              <SectionTitle icon={Smartphone} title="App Permissions" id="permissions-heading" />
              <p className="text-slate-600 leading-relaxed mb-5">
                Our apps may request the following device permissions. We only request permissions that are necessary for the specific features of each app. You can revoke permissions at any time through your device settings.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr style={{ background: "oklch(0.97 0.005 255)" }}>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700 border border-slate-100">Permission</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700 border border-slate-100">Purpose</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700 border border-slate-100">Apps That May Request</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Camera", "Scanning QR codes, profile photos, AR features", "Consumer Mobile, Spatial/AR apps"],
                      ["Microphone", "Voice input, audio recording features", "AI/voice assistant apps"],
                      ["Location (Precise)", "Location-based services, GPS features, nearby search", "Lifestyle, FinTech, IoT apps"],
                      ["Location (Approximate)", "Region-based content and features", "Most consumer apps"],
                      ["Contacts", "Sending invitations, contact-based features", "Social/communication apps"],
                      ["Bluetooth", "Pairing with IoT devices, wearables, smart hardware", "IoT & Hardware, Health apps"],
                      ["Health & Fitness Data", "Reading/writing health metrics (HealthKit / Health Connect)", "Health & Fitness apps only"],
                      ["Notifications", "Push notifications for alerts, updates, reminders", "All apps (optional)"],
                      ["Storage / Files", "Saving/reading files, offline content", "Productivity, media apps"],
                      ["Biometric / Face ID", "Secure authentication (Touch ID, Face ID)", "FinTech, Security apps"],
                      ["Network Access", "Connecting to the internet for app functionality", "All apps"],
                      ["Background App Refresh", "Syncing data while app is in background", "Health, IoT, FinTech apps"],
                    ].map(([perm, purpose, apps], i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "white" : "oklch(0.99 0 0)" }}>
                        <td className="px-4 py-3 border border-slate-100 font-medium text-slate-700">{perm}</td>
                        <td className="px-4 py-3 border border-slate-100 text-slate-600">{purpose}</td>
                        <td className="px-4 py-3 border border-slate-100 text-slate-500 text-xs">{apps}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-slate-500 mt-3">
                Each individual app's App Store / Play Store listing specifies the exact permissions it requires. Permissions are always explained in-app before being requested.
              </p>
            </section>

            {/* ── 7. Third-Party Services ── */}
            <section>
              <SectionAnchor id="third-party" />
              <SectionTitle icon={Globe} title="Third-Party Services & SDKs" id="third-party-heading" />
              <p className="text-slate-600 leading-relaxed mb-5">
                Our apps may integrate third-party services and SDKs. Each third party has its own privacy policy governing their data practices. We encourage you to review their policies.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr style={{ background: "oklch(0.97 0.005 255)" }}>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700 border border-slate-100">Service</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700 border border-slate-100">Purpose</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700 border border-slate-100">Privacy Policy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Google Analytics / Firebase", "App analytics, crash reporting, performance monitoring", "https://policies.google.com/privacy"],
                      ["Apple App Store / TestFlight", "App distribution, in-app purchases", "https://www.apple.com/legal/privacy"],
                      ["Google Play Services", "App distribution, in-app purchases, authentication", "https://policies.google.com/privacy"],
                      ["Stripe", "Payment processing (FinTech apps)", "https://stripe.com/privacy"],
                      ["Amazon Web Services (AWS)", "Cloud hosting, data storage", "https://aws.amazon.com/privacy"],
                      ["Google Cloud Platform", "Cloud infrastructure, ML services", "https://cloud.google.com/terms/cloud-privacy-notice"],
                      ["Apple HealthKit", "Health data integration (iOS health apps)", "https://www.apple.com/legal/privacy"],
                      ["Google Health Connect", "Health data integration (Android health apps)", "https://policies.google.com/privacy"],
                      ["Sentry / Crashlytics", "Crash reporting and error monitoring", "https://sentry.io/privacy"],
                      ["Intercom / Zendesk", "Customer support chat (select apps)", "https://www.intercom.com/legal/privacy"],
                    ].map(([service, purpose, url], i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "white" : "oklch(0.99 0 0)" }}>
                        <td className="px-4 py-3 border border-slate-100 font-medium text-slate-700">{service}</td>
                        <td className="px-4 py-3 border border-slate-100 text-slate-600">{purpose}</td>
                        <td className="px-4 py-3 border border-slate-100">
                          <a href={url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 transition-colors">
                            View Policy <ExternalLink className="h-3 w-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── 8. Children's Privacy ── */}
            <section>
              <SectionAnchor id="children" />
              <SectionTitle icon={Baby} title="Children's Privacy" id="children-heading" />
              <InfoBox type="important">
                <strong>COPPA Notice:</strong> Our Services are not directed to children under the age of 13 (or under 16 in the European Economic Area). We do not knowingly collect personal information from children under these ages.
              </InfoBox>
              <p className="text-slate-600 leading-relaxed mb-4">
                If you are a parent or guardian and you believe your child has provided us with personal information without your consent, please contact us immediately at <a href={`mailto:${PRIVACY_EMAIL}`} className="text-indigo-600 hover:underline">{PRIVACY_EMAIL}</a>. We will take steps to remove that information from our systems promptly.
              </p>
              <p className="text-slate-600 leading-relaxed mb-4">
                For apps that are specifically designed for children (clearly marked as such in their App Store/Play Store listings), we apply additional protections in compliance with COPPA, GDPR-K, and applicable children's privacy laws, including:
              </p>
              <ul className="space-y-2 mb-4">
                {[
                  "No behavioral advertising",
                  "No collection of precise geolocation",
                  "No sharing of personal information with third parties (except as required for the service)",
                  "Parental consent required before collecting any personal information",
                  "No in-app purchases without parental authorization",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "oklch(0.52 0.22 270)" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* ── 9. Your Rights & Choices ── */}
            <section>
              <SectionAnchor id="your-rights" />
              <SectionTitle icon={CheckCircle} title="Your Rights & Choices" id="your-rights-heading" />
              <p className="text-slate-600 leading-relaxed mb-5">
                Depending on your location, you may have the following rights regarding your personal information:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {[
                  { right: "Right to Access", desc: "Request a copy of the personal data we hold about you.", flag: "🇪🇺 🇺🇸 🇮🇳" },
                  { right: "Right to Rectification", desc: "Request correction of inaccurate or incomplete personal data.", flag: "🇪🇺 🇺🇸" },
                  { right: "Right to Erasure", desc: "Request deletion of your personal data ('right to be forgotten').", flag: "🇪🇺 🇺🇸 🇮🇳" },
                  { right: "Right to Portability", desc: "Receive your data in a structured, machine-readable format.", flag: "🇪🇺" },
                  { right: "Right to Object", desc: "Object to processing of your data for direct marketing or profiling.", flag: "🇪🇺" },
                  { right: "Right to Restrict Processing", desc: "Request that we limit how we use your data in certain circumstances.", flag: "🇪🇺" },
                  { right: "Opt-Out of Sale (CCPA)", desc: "California residents may opt out of the 'sale' of personal information (we do not sell data).", flag: "🇺🇸 CA" },
                  { right: "Withdraw Consent", desc: "Withdraw consent for processing at any time where consent is the legal basis.", flag: "🇪🇺 🇺🇸 🇮🇳" },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-900 text-sm">{item.right}</span>
                      <span className="text-xs text-slate-400">{item.flag}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
              <p className="text-slate-600 leading-relaxed mb-4">
                To exercise any of these rights, please contact us at <a href={`mailto:${PRIVACY_EMAIL}`} className="text-indigo-600 hover:underline">{PRIVACY_EMAIL}</a>. We will respond to your request within 30 days (or as required by applicable law). We may need to verify your identity before processing your request.
              </p>
              <InfoBox type="note">
                You can also manage many of your data preferences directly within each app's Settings section, including notification preferences, data sync settings, and account deletion.
              </InfoBox>
            </section>

            {/* ── 10. Push Notifications ── */}
            <section>
              <SectionAnchor id="notifications" />
              <SectionTitle icon={Bell} title="Push Notifications" id="notifications-heading" />
              <p className="text-slate-600 leading-relaxed mb-4">
                Our apps may send push notifications to your device. We request your permission before sending notifications. Types of notifications we may send include:
              </p>
              <ul className="space-y-2 mb-5">
                {[
                  "Service updates and important account alerts",
                  "Security alerts (login attempts, password changes)",
                  "Feature announcements and product updates",
                  "Reminders and scheduled alerts (health, productivity apps)",
                  "Promotional messages (only with your explicit consent)",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <Bell className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: "oklch(0.52 0.22 270)" }} />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-slate-600 leading-relaxed">
                You can disable push notifications at any time through your device's notification settings or within the app's settings menu. Disabling notifications will not affect your ability to use the app.
              </p>
            </section>

            {/* ── 11. Data Retention & Deletion ── */}
            <section>
              <SectionAnchor id="data-retention" />
              <SectionTitle icon={Trash2} title="Data Retention & Deletion" id="data-retention-heading" />
              <p className="text-slate-600 leading-relaxed mb-5">
                We retain your personal information for as long as necessary to provide our Services, comply with legal obligations, resolve disputes, and enforce our agreements. Typical retention periods are:
              </p>
              <div className="overflow-x-auto mb-5">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr style={{ background: "oklch(0.97 0.005 255)" }}>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700 border border-slate-100">Data Type</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700 border border-slate-100">Retention Period</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Active account data", "Duration of account + 30 days after deletion request"],
                      ["Transaction records", "7 years (legal/tax compliance)"],
                      ["App usage analytics", "Up to 24 months (anonymized after 12 months)"],
                      ["Support communications", "3 years after case resolution"],
                      ["Health & fitness data", "Duration of account; deleted within 30 days of account deletion"],
                      ["Crash / error logs", "90 days"],
                      ["Marketing communications", "Until you unsubscribe + 30 days"],
                    ].map(([type, period], i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "white" : "oklch(0.99 0 0)" }}>
                        <td className="px-4 py-3 border border-slate-100 font-medium text-slate-700">{type}</td>
                        <td className="px-4 py-3 border border-slate-100 text-slate-600">{period}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Account & Data Deletion</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                You can request deletion of your account and associated personal data at any time by:
              </p>
              <ul className="space-y-2 mb-4">
                {[
                  "Using the 'Delete Account' option in the app's Settings menu",
                  `Emailing us at ${PRIVACY_EMAIL} with subject line "Data Deletion Request"`,
                  `Submitting a request through our support page at https://safecodeg.com/support`,
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <span className="h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
                      style={{ background: "oklch(0.52 0.22 270)" }}>{i + 1}</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-slate-600 leading-relaxed">
                We will process deletion requests within <strong className="text-slate-900">30 days</strong>. Some data may be retained longer where required by law (e.g., financial transaction records).
              </p>
            </section>

            {/* ── 12. Policy Updates ── */}
            <section>
              <SectionAnchor id="updates" />
              <SectionTitle icon={RefreshCw} title="Policy Updates" id="updates-heading" />
              <p className="text-slate-600 leading-relaxed mb-4">
                We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make material changes, we will:
              </p>
              <ul className="space-y-2 mb-5">
                {[
                  "Update the 'Last Updated' date at the top of this page",
                  "Send an in-app notification or push notification to active users",
                  "For significant changes, send an email notification to registered users",
                  "Display a prominent notice within the app for at least 30 days",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "oklch(0.52 0.22 270)" }} />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-slate-600 leading-relaxed">
                Your continued use of our Services after the effective date of the updated policy constitutes your acceptance of the changes. If you do not agree to the updated policy, you must stop using our Services and may request deletion of your account.
              </p>
            </section>

            {/* ── 13. Contact ── */}
            <section>
              <SectionAnchor id="contact" />
              <SectionTitle icon={Mail} title="Contact Us" id="contact-heading" />
              <p className="text-slate-600 leading-relaxed mb-6">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                {[
                  {
                    entity: "American Group LLC",
                    role: "Data Controller (USA)",
                    address: "Santa Clara, California, USA",
                    phone: "+1 (510) 458-0959",
                    email: PRIVACY_EMAIL,
                    flag: "🇺🇸",
                    color: "oklch(0.52 0.22 270)",
                  },
                  {
                    entity: "SafeCodeX Research Center Pvt. Ltd.",
                    role: "Data Processor (India)",
                    address: "Hyderabad, India",
                    phone: "+91 74168 66689",
                    email: PRIVACY_EMAIL,
                    flag: "🇮🇳",
                    color: "oklch(0.78 0.18 75)",
                  },
                ].map((c, i) => (
                  <div key={i} className="p-5 rounded-2xl border border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{c.flag}</span>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{c.entity}</div>
                        <div className="text-xs text-slate-400 font-mono">{c.role}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: c.color }} />
                  {c.address}
                       </div>
                       {c.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <span className="h-3.5 w-3.5 shrink-0 text-xs" style={{ color: c.color }}>📞</span>
                          <a href={`tel:${c.phone.replace(/[^+\d]/g, '')}`} className="hover:underline">{c.phone}</a>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="h-3.5 w-3.5 shrink-0" style={{ color: c.color }} />
                        <a href={`mailto:${c.email}`} className="hover:underline">{c.email}</a>
                        <span className="text-xs text-slate-400">(Privacy / Support)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <InfoBox type="note">
                We aim to respond to all privacy-related inquiries within <strong>5 business days</strong> and to complete data subject requests within <strong>30 days</strong> as required by applicable law.
              </InfoBox>
            </section>

            {/* Footer note */}
            <div className="border-t border-slate-100 pt-8">
              <p className="text-xs text-slate-400 leading-relaxed">
                This Privacy Policy was last updated on <strong>{LAST_UPDATED}</strong> and is effective as of <strong>{EFFECTIVE_DATE}</strong>. This policy applies to all applications and services published by {COMPANY_NAME} and {INDIA_ENTITY}. For app-specific privacy details, refer to the individual app's listing on the Apple App Store or Google Play Store.
              </p>
              <div className="flex flex-wrap gap-4 mt-4">
                <Link href="/contact" className="text-xs text-indigo-600 hover:underline">Contact Us</Link>
                <Link href="/about" className="text-xs text-indigo-600 hover:underline">About Us</Link>
                <a href={`mailto:${PRIVACY_EMAIL}`} className="text-xs text-indigo-600 hover:underline">{PRIVACY_EMAIL}</a>
              </div>
            </div>

          </article>
        </div>
      </div>

      <Footer />
    </div>
  );
}
