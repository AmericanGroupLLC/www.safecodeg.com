/**
 * SafeCodeX Research Center Page — "Luminous Clarity" Design System
 * Saffron Gold + Teal palette for Indian entity
 */
import { useEffect } from "react";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ArrowRight, ExternalLink, Code2, Brain, Shield, Globe, Zap, Users, CheckCircle } from "lucide-react";

function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }); },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

const services = [
  {
    icon: Code2,
    emoji: "💻",
    title: "Software Outsourcing",
    desc: "End-to-end custom software development tailored to your unique needs. From custom software development to mobile app solutions and cloud-based platforms — we deliver results that exceed expectations.",
    features: ["Custom Software Development", "Mobile App Solutions", "Cloud-Based Platforms", "API Development & Integration"],
    color: "oklch(0.52 0.22 270)",
  },
  {
    icon: Brain,
    emoji: "🧠",
    title: "AI & Machine Learning",
    desc: "Frontier research in artificial intelligence, machine learning, and cognitive computing. We stay at the forefront of emerging technologies to give your business a competitive edge.",
    features: ["LLM Development & Fine-tuning", "Computer Vision", "NLP Solutions", "AI-Powered Automation"],
    color: "oklch(0.78 0.18 75)",
  },
  {
    icon: Globe,
    emoji: "🌐",
    title: "IoT & Emerging Tech",
    desc: "Comprehensive IoT solutions, blockchain development, and emerging technology research. We transform ideas into reality across domains from smart devices to decentralized systems.",
    features: ["IoT Device Integration", "Blockchain Development", "Edge Computing", "Smart Systems"],
    color: "oklch(0.72 0.14 165)",
  },
  {
    icon: Shield,
    emoji: "🔐",
    title: "CyberSecurity Research",
    desc: "Advanced security research, vulnerability assessment, and enterprise-grade security solutions. Protecting your digital assets with cutting-edge threat intelligence and zero-trust architecture.",
    features: ["Security Audits", "Penetration Testing", "Compliance Solutions", "Zero-Trust Architecture"],
    color: "oklch(0.55 0.18 30)",
  },
  {
    icon: Zap,
    emoji: "⚡",
    title: "R&D Consulting",
    desc: "Strategic research and development consulting to help your organization innovate faster. We collaborate closely with clients to explore new frontiers and create breakthrough solutions.",
    features: ["Technology Strategy", "Innovation Workshops", "Proof of Concept", "Technical Due Diligence"],
    color: "oklch(0.65 0.16 310)",
  },
  {
    icon: Users,
    emoji: "👥",
    title: "IT Staff Augmentation",
    desc: "Access India's top engineering talent on demand. Scale your team quickly with pre-vetted, highly skilled developers, architects, and data scientists.",
    features: ["Dedicated Development Teams", "Staff Augmentation", "Technical Recruitment", "Offshore Development"],
    color: "oklch(0.60 0.15 200)",
  },
];

const whyUs = [
  "Dedicated team of world-class experts",
  "Commitment to innovation and quality",
  "End-to-end project ownership",
  "On-time, within-budget delivery",
  "Cutting-edge technology stack",
  "Transparent communication",
  "Agile development methodology",
  "24/7 support and maintenance",
];

export default function SCGPage() {
  useReveal();

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero */}
      <section
        className="relative pt-28 pb-20 overflow-hidden"
        style={{ background: "oklch(0.16 0.04 75)" }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663397835904/iKtH34UE32MfRNT3w4zNEC/scg-section-bg-6MiGbt85QJDHzM3FnDARSD.webp)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, oklch(0.16 0.04 75) 40%, oklch(0.22 0.06 75) 100%)" }} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663397835904/iKtH34UE32MfRNT3w4zNEC/scg-logo-W2HQYWhiqBqMj8z6dwYjXz.webp"
              alt="SCG"
              className="h-14 w-14 object-contain"
            />
            <div>
              <div className="text-white/50 text-xs font-mono uppercase tracking-widest">🇮🇳 India · Private Limited</div>
            </div>
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
            SafeCodeX
            <br />
            <span style={{ color: "oklch(0.78 0.18 75)" }}>Research Center</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mb-8 leading-relaxed">
            India's premier software outsourcing and research & development center. Empowering innovation, delivering excellence — transforming your vision into reality with world-class engineering talent.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white btn-press"
              style={{ background: "oklch(0.78 0.18 75)", color: "oklch(0.14 0.04 75)" }}
            >
              Start a Project <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://safecodeg.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white border border-white/20 hover:bg-white/10 transition-all btn-press"
            >
              <ExternalLink className="h-4 w-4" /> Visit SafeCodeG.com
            </a>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L1440 0V60H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="reveal">
              <div className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400 mb-3">Our Mission</div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                Accelerating your success with
                <span className="gradient-text-gold"> innovative IT solutions</span>
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                At SafeCodeX Research Center, we are dedicated to revolutionizing the way businesses harness the power of technology. As a trusted partner in IT software outsourcing and research & development services, we bring a wealth of expertise to the table.
              </p>
              <p className="text-slate-600 leading-relaxed mb-6">
                Our mission is to empower your organization with cutting-edge solutions that drive growth, efficiency, and innovation. With a team of highly skilled professionals, we provide end-to-end IT software outsourcing services tailored to your unique needs.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {whyUs.map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="reveal reveal-delay-2">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "10+", label: "Years Experience", color: "oklch(0.78 0.18 75)" },
                  { value: "200+", label: "Projects Delivered", color: "oklch(0.52 0.22 270)" },
                  { value: "50+", label: "Expert Engineers", color: "oklch(0.72 0.14 165)" },
                  { value: "98%", label: "Client Satisfaction", color: "oklch(0.55 0.18 30)" },
                ].map((s, i) => (
                  <div key={i} className="p-6 rounded-2xl border border-slate-100 bg-slate-50 text-center">
                    <div className="text-4xl font-bold stat-number mb-2" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-widest">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20" style={{ background: "oklch(0.97 0.005 75)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 reveal">
            <div className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400 mb-3">Services</div>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              What SafeCodeX delivers
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <div
                key={s.title}
                className={`reveal reveal-delay-${(i % 3) + 1} p-6 rounded-2xl bg-white border border-slate-100 product-card`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${s.color.replace(")", " / 0.1)")}` }}>
                    {s.emoji}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{s.title}</h3>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">{s.desc}</p>
                <ul className="space-y-1.5">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: s.color }} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 reveal">
            <div className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400 mb-3">Leadership</div>
            <h2 className="text-4xl font-bold text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Meet the team
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Mark Wagh", role: "Founder & CEO", flag: "🇺🇸", initial: "M" },
              { name: "Maria Rhodes", role: "Lead Web Developer", flag: "🇺🇸", initial: "M" },
              { name: "Ruby Wilson", role: "HR Director", flag: "🇮🇳", initial: "R" },
              { name: "Michael Vaughn", role: "Senior Developer", flag: "🇺🇸", initial: "M" },
            ].map((person, i) => (
              <div key={person.name} className={`reveal reveal-delay-${i + 1} text-center p-6 rounded-2xl border border-slate-100 bg-slate-50`}>
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-700 font-bold text-xl mx-auto mb-4">
                  {person.initial}
                </div>
                <div className="font-bold text-slate-900 mb-1">{person.flag} {person.name}</div>
                <div className="text-sm text-slate-500">{person.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ background: "oklch(0.16 0.04 75)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center reveal">
          <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Partner with SafeCodeX
          </h2>
          <p className="text-white/60 mb-8 text-lg">
            Unlock the full potential of your projects with India's premier R&D center.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold btn-press"
              style={{ background: "oklch(0.78 0.18 75)", color: "oklch(0.14 0.04 75)" }}
            >
              Get in Touch <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://safecodeg.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white border border-white/20 hover:bg-white/10 transition-all btn-press"
            >
              <ExternalLink className="h-4 w-4" /> Visit SafeCodeG.com
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
