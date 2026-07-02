/**
 * Careers Page — MNC Enterprise Dark Theme v5.0
 * Full dark, premium job listings, world-class design
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ArrowRight, MapPin, Clock, Briefcase, Code2, Brain, Shield, Smartphone, Globe, Zap, Star, Users, CheckCircle, Link2, Cpu, X, Send, Heart, Plane, ShoppingCart, Lock, Database, Layers, FlaskConical, Radio } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const WEB3FORMS_KEY = "97f985ce-75d3-47e8-b941-3e85db2e7395";

// ── Full-time openings grouped by vertical ────────────────────────────
const openings = [
  // Enterprise AI & DevTools
  {
    title: "Senior AI/ML Engineer",
    dept: "Enterprise AI",
    location: "Santa Clara, CA / Remote",
    type: "Full-time",
    icon: Brain,
    color: "#818CF8",
    desc: "Build frontier AI systems including LLMs, RAG pipelines, and cognitive agents for enterprise deployments across AGL's 20+ AI products.",
    tags: ["Python", "PyTorch", "LLM", "RAG", "LangChain"],
  },
  {
    title: "AI Product Engineer",
    dept: "Enterprise AI",
    location: "Remote",
    type: "Full-time",
    icon: Cpu,
    color: "#A78BFA",
    desc: "Bridge research and product — take LLM prototypes to production-grade AI features inside AGL's enterprise DevTools and SaaS products.",
    tags: ["Python", "FastAPI", "OpenAI", "Gemini", "TypeScript"],
  },
  {
    title: "MLOps Engineer",
    dept: "Enterprise AI",
    location: "Remote",
    type: "Full-time",
    icon: Layers,
    color: "#6366F1",
    desc: "Design and operate ML training pipelines, model serving infrastructure, and monitoring systems for AGL's AI product suite.",
    tags: ["MLflow", "Kubeflow", "Docker", "AWS SageMaker", "Python"],
  },
  // Consumer Mobile
  {
    title: "iOS Developer (Swift)",
    dept: "Consumer Mobile",
    location: "India / Remote",
    type: "Full-time",
    icon: Smartphone,
    color: "#34D399",
    desc: "Build world-class iOS apps with on-device AI, HealthKit, Wear OS integration, and offline-first architecture across AGL's 30+ mobile products.",
    tags: ["Swift", "SwiftUI", "CoreML", "HealthKit", "WatchKit"],
  },
  {
    title: "Android Developer (Kotlin)",
    dept: "Consumer Mobile",
    location: "India / Remote",
    type: "Full-time",
    icon: Smartphone,
    color: "#60A5FA",
    desc: "Build native Android apps with Jetpack Compose, ML Kit, Wear OS, and BLE integrations. Ship features used by millions of users.",
    tags: ["Kotlin", "Jetpack Compose", "ML Kit", "Wear OS", "BLE"],
  },
  {
    title: "React Native / Flutter Engineer",
    dept: "Consumer Mobile",
    location: "Remote",
    type: "Full-time",
    icon: Code2,
    color: "#38BDF8",
    desc: "Build cross-platform mobile apps (React Native & Flutter) for AGL's social, lifestyle, and utility product lines targeting iOS and Android.",
    tags: ["React Native", "Flutter", "Dart", "TypeScript", "Firebase"],
  },
  // FinTech & E-Commerce
  {
    title: "FinTech Full-Stack Engineer",
    dept: "FinTech & E-Commerce",
    location: "Remote",
    type: "Full-time",
    icon: ShoppingCart,
    color: "#FBBF24",
    desc: "Build scalable FinTech platforms — digital banking, payment processing, trading systems, and cross-border transfer products.",
    tags: ["TypeScript", "React", "Node.js", "PostgreSQL", "Stripe"],
  },
  {
    title: "Blockchain / Web3 Engineer",
    dept: "FinTech & E-Commerce",
    location: "Remote",
    type: "Full-time",
    icon: Link2,
    color: "#F59E0B",
    desc: "Develop DeFi protocols, smart contracts, and Web3 wallet integrations. Contribute to AGL's tokenization, on-chain identity, and NFT products.",
    tags: ["Solidity", "Rust", "Ethereum", "Solana", "Hardhat"],
  },
  {
    title: "Quantitative / Algo Trading Engineer",
    dept: "FinTech & E-Commerce",
    location: "Santa Clara, CA / Remote",
    type: "Full-time",
    icon: Database,
    color: "#10B981",
    desc: "Build real-time market data pipelines, algorithmic trading strategies, and SEC filing aggregation systems for ApexMarketWatch and related products.",
    tags: ["Python", "C++", "WebSockets", "PostgreSQL", "Redis"],
  },
  // CyberSecurity & Infra
  {
    title: "Cybersecurity Engineer",
    dept: "CyberSecurity & Infra",
    location: "Remote",
    type: "Full-time",
    icon: Shield,
    color: "#F87171",
    desc: "Design enterprise security systems — SIEM, threat hunting, zero-trust architecture, and network security auditing tools.",
    tags: ["Python", "SIEM", "Zero-Trust", "Kubernetes", "Splunk"],
  },
  {
    title: "Penetration Tester / Red Team Engineer",
    dept: "CyberSecurity & Infra",
    location: "Remote",
    type: "Full-time",
    icon: Lock,
    color: "#EF4444",
    desc: "Conduct offensive security assessments, penetration tests, and red team exercises for enterprise clients and AGL's own security products.",
    tags: ["Kali Linux", "Metasploit", "Burp Suite", "Python", "OSCP"],
  },
  {
    title: "DevOps / Cloud Engineer",
    dept: "CyberSecurity & Infra",
    location: "Remote",
    type: "Full-time",
    icon: Globe,
    color: "#A78BFA",
    desc: "Manage multi-cloud infrastructure, CI/CD pipelines, and Kubernetes clusters supporting 77+ production products across AWS, GCP, and Azure.",
    tags: ["Kubernetes", "Terraform", "AWS", "GCP", "GitHub Actions"],
  },
  // Health & Wellness
  {
    title: "Health Tech iOS/Android Engineer",
    dept: "Health & Wellness",
    location: "India / Remote",
    type: "Full-time",
    icon: Heart,
    color: "#F43F5E",
    desc: "Build health and wellness mobile apps with HealthKit, Google Fit, BLE wearable integrations, and real-time biometric tracking.",
    tags: ["Swift", "Kotlin", "HealthKit", "BLE", "React Native"],
  },
  {
    title: "Health Algorithms Engineer",
    dept: "Health & Wellness",
    location: "Remote",
    type: "Full-time",
    icon: FlaskConical,
    color: "#EC4899",
    desc: "Design and validate health algorithms for heart rate, SpO2, sleep scoring, and stress detection used in AGL's wearable and health app products.",
    tags: ["Python", "Signal Processing", "ML", "HealthKit", "Clinical Validation"],
  },
  // Travel & Aviation
  {
    title: "Aviation Software Engineer",
    dept: "Travel & Aviation",
    location: "Santa Clara, CA / Remote",
    type: "Full-time",
    icon: Plane,
    color: "#0EA5E9",
    desc: "Build aviation apps for pilots — FAA exam prep, flight tracking, logbooks, NOTAM feeds, and real-time ATC/weather integrations.",
    tags: ["Swift", "Kotlin", "FAA APIs", "Aviation Data", "React Native"],
  },
  {
    title: "Travel & Maps Platform Engineer",
    dept: "Travel & Aviation",
    location: "Remote",
    type: "Full-time",
    icon: Globe,
    color: "#22D3EE",
    desc: "Build offline-first maps, navigation, and travel discovery apps. Integrate OpenStreetMap, Google Maps, and real-time transit APIs.",
    tags: ["Kotlin", "Swift", "OpenStreetMap", "Google Maps SDK", "Offline-first"],
  },
  // Social & Lifestyle
  {
    title: "Social Platform Engineer",
    dept: "Social & Lifestyle",
    location: "Remote",
    type: "Full-time",
    icon: Users,
    color: "#8B5CF6",
    desc: "Build social and community features — real-time messaging, P2P multiplayer, content feeds, and offline-first social experiences.",
    tags: ["Kotlin", "WebSockets", "Firebase", "BLE", "P2P"],
  },
  {
    title: "Streaming & Media Engineer",
    dept: "Social & Lifestyle",
    location: "Remote",
    type: "Full-time",
    icon: Radio,
    color: "#C084FC",
    desc: "Build global radio streaming, podcast, and media casting apps with GPS-based filtering, multi-language support, and Chromecast/AirPlay integration.",
    tags: ["Flutter", "ExoPlayer", "AVFoundation", "Chromecast", "GPS"],
  },
  // ── Internship Positions ──────────────────────────────────────────────
  {
    title: "AI / LLM Mobile App Intern",
    dept: "Enterprise AI",
    location: "Remote / India",
    type: "Internship · 3–6 months",
    icon: Cpu,
    color: "#F472B6",
    badge: "Internship",
    desc: "Build on-device AI features and LLM-powered mobile apps for iOS and Android. Work with GPT-4o, Gemini, and on-device models (CoreML / TFLite) to ship real AI features inside AGL consumer apps.",
    tags: ["Swift / Kotlin", "LLM APIs", "CoreML", "TFLite", "Flutter"],
  },
  {
    title: "LLM & Generative AI Research Intern",
    dept: "Enterprise AI",
    location: "Remote",
    type: "Internship · 3–6 months",
    icon: Brain,
    color: "#34D399",
    badge: "Internship",
    desc: "Fine-tune, prompt-engineer, and evaluate large language models. Build RAG pipelines, vector search systems, and AI agent workflows using LangChain, LlamaIndex, and OpenAI APIs.",
    tags: ["Python", "LangChain", "OpenAI API", "Vector DB", "Hugging Face"],
  },
  {
    title: "Blockchain & Web3 Developer Intern",
    dept: "FinTech & E-Commerce",
    location: "Remote",
    type: "Internship · 3–6 months",
    icon: Link2,
    color: "#FBBF24",
    badge: "Internship",
    desc: "Develop and audit smart contracts on Ethereum and Solana. Build DeFi components, NFT systems, and Web3 wallet integrations for AGL's blockchain vertical.",
    tags: ["Solidity", "Rust", "Ethereum", "Solana", "Hardhat"],
  },
  {
    title: "Cybersecurity & Blockchain Audit Intern",
    dept: "CyberSecurity & Infra",
    location: "Remote",
    type: "Internship · 3–6 months",
    icon: Shield,
    color: "#60A5FA",
    badge: "Internship",
    desc: "Learn smart contract security auditing and network penetration testing. Identify vulnerabilities and write security reports alongside senior engineers.",
    tags: ["Solidity", "Slither", "Foundry", "Burp Suite", "Python"],
  },
  {
    title: "Health Tech Mobile Intern",
    dept: "Health & Wellness",
    location: "Remote / India",
    type: "Internship · 3–6 months",
    icon: Heart,
    color: "#F43F5E",
    badge: "Internship",
    desc: "Build health and wellness mobile features — biometric dashboards, BLE wearable sync, and health algorithm integrations for AGL's health product line.",
    tags: ["Swift", "Kotlin", "HealthKit", "BLE", "React Native"],
  },
  {
    title: "FinTech & Data Engineering Intern",
    dept: "FinTech & E-Commerce",
    location: "Remote",
    type: "Internship · 3–6 months",
    icon: Database,
    color: "#10B981",
    badge: "Internship",
    desc: "Build real-time financial data pipelines, market data aggregators, and analytics dashboards for AGL's FinTech products including MyFinance and ApexMarketWatch.",
    tags: ["Python", "PostgreSQL", "Redis", "WebSockets", "TypeScript"],
  },
  {
    title: "Travel & Aviation App Intern",
    dept: "Travel & Aviation",
    location: "Remote",
    type: "Internship · 3–6 months",
    icon: Plane,
    color: "#0EA5E9",
    badge: "Internship",
    desc: "Contribute to AGL's aviation and travel apps — FAA data integrations, offline maps, flight tracking, and pilot study tools.",
    tags: ["Swift", "Kotlin", "FAA APIs", "Maps SDK", "React Native"],
  },
];

const perks = [
  { icon: Globe, title: "Remote-First", desc: "Work from anywhere. We have team members across the US, India, and beyond." },
  { icon: Zap, title: "Ship Real Products", desc: "Your work goes to production and reaches real users — not internal demos." },
  { icon: Star, title: "Competitive Compensation", desc: "Market-rate salaries, equity participation, and performance bonuses." },
  { icon: Users, title: "Elite Team", desc: "Work alongside engineers who've shipped products used by millions of people." },
  { icon: Brain, title: "AI-First Culture", desc: "Every engineer has access to frontier AI tools, models, and infrastructure." },
  { icon: Briefcase, title: "Growth Opportunities", desc: "Fast-growing company with clear paths to senior, staff, and principal roles." },
];

export default function CareersPage() {
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [applyJob, setApplyJob] = useState<{ title: string; dept: string; type: string } | null>(null);
  const [appForm, setAppForm] = useState({ name: "", email: "", phone: "", linkedin: "", message: "" });
  const [appSending, setAppSending] = useState(false);
  const [appSent, setAppSent] = useState(false);

  const handleApply = (job: { title: string; dept: string; type: string }) => {
    setApplyJob(job);
    setAppForm({ name: "", email: "", phone: "", linkedin: "", message: "" });
    setAppSent(false);
  };

  const handleAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyJob) return;
    setAppSending(true);
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `Job Application: ${applyJob.title} (${applyJob.dept}) — ${appForm.name}`,
          from_name: "safecodeg.com Careers",
          name: appForm.name,
          email: appForm.email,
          phone: appForm.phone || "Not provided",
          linkedin: appForm.linkedin || "Not provided",
          position: applyJob.title,
          department: applyJob.dept,
          employment_type: applyJob.type,
          cover_message: appForm.message,
          botcheck: "",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAppSent(true);
        toast.success("Application submitted! We'll be in touch within 3–5 business days.");
      } else {
        throw new Error(data.message || "Submission failed");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(msg || "Failed to submit. Please email careers@safecodeg.com directly.");
    } finally {
      setAppSending(false);
    }
  };

  return (
    <div style={{ background: "#030408", color: "white", minHeight: "100vh" }}>
      <Navigation />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-24 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663397835904/iKtH34UE32MfRNT3w4zNEC/agl-careers-bg-MKcno5dvetSyku83JGwEhq.webp"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(7,11,20,0.97) 0%, rgba(7,11,20,0.88) 50%, rgba(7,11,20,0.75) 100%)" }} />
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 20% 60%, rgba(124,58,237,0.2), transparent 55%), radial-gradient(ellipse at 80% 30%, rgba(245,158,11,0.08), transparent 45%)" }} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: "linear-gradient(to bottom, transparent, #030408)" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-xs font-semibold uppercase tracking-widest mb-8">
              <Briefcase className="w-3.5 h-3.5" /> Careers at AGL
            </div>
            <h1 className="font-black text-white mb-6 tracking-tight" style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(3rem, 7vw, 6rem)" }}>
              Build the Future.<br />
              <span style={{ background: "linear-gradient(135deg, #818CF8, #A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                With Us.
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl leading-relaxed mb-10">
              Join a team of world-class engineers building 77+ products across AI, mobile, FinTech, and cybersecurity. Remote-first, globally distributed, always shipping.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#openings">
                <button className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105" style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)", boxShadow: "0 0 30px rgba(99,102,241,0.3)" }}>
                  View Open Roles <ArrowRight className="w-4 h-4" />
                </button>
              </a>
              <Link href="/contact">
                <button className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold border border-white/15 text-white hover:bg-white/8 transition-all duration-300">
                  Send Open Application
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Perks ─────────────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-xs font-semibold uppercase tracking-widest mb-6">
              Why Join AGL
            </div>
            <h2 className="font-black text-white tracking-tight" style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(2rem, 4vw, 3rem)" }}>
              Work that matters.<br />
              <span style={{ background: "linear-gradient(135deg, #FBBF24, #F59E0B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Perks that reflect it.
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {perks.map((perk, i) => {
              const Icon = perk.icon;
              return (
                <motion.div
                  key={perk.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.6 }}
                  className="p-6 rounded-2xl transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(99,102,241,0.15)", color: "#818CF8" }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-sm mb-2">{perk.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{perk.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Open Roles ────────────────────────────────────────────────────── */}
      <section id="openings" className="py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-xs font-semibold uppercase tracking-widest mb-6">
              Open Positions
            </div>
            <h2 className="font-black text-white tracking-tight" style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(2rem, 4vw, 3rem)" }}>
              Current openings
            </h2>
          </motion.div>

          {/* Department filter tabs */}
          <div className="flex flex-wrap gap-2 mb-10">
            {["All", "Enterprise AI", "Consumer Mobile", "FinTech & E-Commerce", "CyberSecurity & Infra", "Health & Wellness", "Travel & Aviation", "Social & Lifestyle"].map((dept) => (
              <button
                key={dept}
                onClick={() => setActiveFilter(dept)}
                className="px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                style={activeFilter === dept
                  ? { background: "rgba(124,58,237,0.25)", border: "1px solid rgba(124,58,237,0.5)", color: "#C4B5FD" }
                  : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#94A3B8" }}
              >
                {dept}
              </button>
            ))}
          </div>
          {/* Full-time roles */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Full-Time Positions</span>
              <div className="flex-1 h-px bg-white/8" />
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">{openings.filter(j => !('badge' in j) && (activeFilter === "All" || j.dept === activeFilter)).length} open</span>
            </div>
            <div className="space-y-4">
              {openings.filter(j => !('badge' in j) && (activeFilter === "All" || j.dept === activeFilter)).map((job, i) => {
                const Icon = job.icon;
                return (
                  <motion.div
                    key={job.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07, duration: 0.6 }}
                    className="group flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-6 rounded-2xl transition-all duration-300 cursor-pointer"
                    onClick={() => handleApply({ title: job.title, dept: job.dept, type: job.type })}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: job.color + "20", color: job.color }}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-white text-base" style={{ fontFamily: "Sora, sans-serif" }}>{job.title}</h3>
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: job.color + "20", color: job.color }}>{job.dept}</span>
                        </div>
                        <p className="text-slate-500 text-sm mb-3">{job.desc}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {job.tags.map((tag) => (
                            <span key={tag} className="px-2 py-0.5 rounded text-xs font-mono text-slate-400 border border-white/8 bg-white/[0.03]">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col lg:items-end gap-3 flex-shrink-0">
                      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {job.type}</span>
                      </div>
                      <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0" style={{ background: job.color + "20", color: job.color }} onClick={(e) => { e.stopPropagation(); handleApply({ title: job.title, dept: job.dept, type: job.type }); }}>
                        Apply Now <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Internship roles */}
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Internship Positions</span>
              <div className="flex-1 h-px bg-white/8" />
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-500/15 text-pink-300 border border-pink-500/20">{openings.filter(j => 'badge' in j).length} open</span>
            </div>
            <p className="text-slate-500 text-sm mb-6 max-w-2xl">3–6 month internships for students and recent graduates. Work on real products, get mentored by senior engineers, and build a portfolio that stands out.</p>
            <div className="space-y-4">
              {openings.filter(j => 'badge' in j).map((job, i) => {
                const Icon = job.icon;
                return (
                  <motion.div
                    key={job.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07, duration: 0.6 }}
                    className="group flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-6 rounded-2xl border border-pink-500/10 bg-pink-500/[0.02] hover:bg-pink-500/[0.04] hover:border-pink-500/20 transition-all duration-300 cursor-pointer"
                    onClick={() => handleApply({ title: job.title, dept: job.dept, type: job.type })}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: job.color + "20", color: job.color }}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-white text-base" style={{ fontFamily: "Sora, sans-serif" }}>{job.title}</h3>
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: job.color + "20", color: job.color }}>{job.dept}</span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-pink-500/20 text-pink-300 border border-pink-500/25">Internship</span>
                        </div>
                        <p className="text-slate-500 text-sm mb-3">{job.desc}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {job.tags.map((tag) => (
                            <span key={tag} className="px-2 py-0.5 rounded text-xs font-mono text-slate-400 border border-white/8 bg-white/[0.03]">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col lg:items-end gap-3 flex-shrink-0">
                      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {job.type}</span>
                      </div>
                      <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0" style={{ background: job.color + "20", color: job.color }} onClick={(e) => { e.stopPropagation(); handleApply({ title: job.title, dept: job.dept, type: job.type }); }}>
                        Apply <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-10 p-6 rounded-2xl text-center"
          >
            <p className="text-slate-400 text-sm mb-4">
              Don't see a role that fits? We're always looking for exceptional talent.
            </p>
            <a href="mailto:careers@safecodeg.com">
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 transition-all duration-300">
                Send Open Application → careers@safecodeg.com
              </button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── Application Modal ─────────────────────────────────────────────── */}
      <Dialog open={!!applyJob} onOpenChange={(open) => { if (!open) setApplyJob(null); }}>
        <DialogContent className="max-w-lg" style={{ background: "#0A0F1E", border: "1px solid rgba(124,58,237,0.3)", color: "white" }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "Sora, sans-serif", color: "white" }}>
              {appSent ? "Application Received!" : `Apply — ${applyJob?.title}`}
            </DialogTitle>
            {!appSent && (
              <p className="text-slate-400 text-sm">{applyJob?.dept} · {applyJob?.type}</p>
            )}
          </DialogHeader>

          {appSent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(16,185,129,0.15)" }}>
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-slate-300 text-sm mb-2">Your application has been sent to <strong className="text-white">contact@safecodeg.com</strong></p>
              <p className="text-slate-500 text-xs">We'll review it and get back to you within 3–5 business days.</p>
              <button onClick={() => setApplyJob(null)} className="mt-6 px-5 py-2 rounded-lg text-sm font-semibold text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/10 transition-all">
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleAppSubmit} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Full Name *</label>
                  <input type="text" required value={appForm.name} onChange={(e) => setAppForm({ ...appForm, name: e.target.value })} placeholder="Jane Smith" className="w-full px-3 py-2.5 rounded-lg text-white text-sm placeholder-slate-600 outline-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email *</label>
                  <input type="email" required value={appForm.email} onChange={(e) => setAppForm({ ...appForm, email: e.target.value })} placeholder="jane@email.com" className="w-full px-3 py-2.5 rounded-lg text-white text-sm placeholder-slate-600 outline-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Phone</label>
                  <input type="tel" value={appForm.phone} onChange={(e) => setAppForm({ ...appForm, phone: e.target.value })} placeholder="+1 555 000 0000" className="w-full px-3 py-2.5 rounded-lg text-white text-sm placeholder-slate-600 outline-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">LinkedIn URL</label>
                  <input type="url" value={appForm.linkedin} onChange={(e) => setAppForm({ ...appForm, linkedin: e.target.value })} placeholder="linkedin.com/in/..." className="w-full px-3 py-2.5 rounded-lg text-white text-sm placeholder-slate-600 outline-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Why do you want to join AGL? *</label>
                <textarea required rows={4} value={appForm.message} onChange={(e) => setAppForm({ ...appForm, message: e.target.value })} placeholder="Tell us about your experience, what excites you about this role, and any relevant projects..." className="w-full px-3 py-2.5 rounded-lg text-white text-sm placeholder-slate-600 outline-none resize-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setApplyJob(null)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-slate-400 border border-white/10 hover:bg-white/5 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={appSending} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-60" style={{ background: "linear-gradient(135deg, #7C3AED, #4F46E5)" }}>
                  {appSending ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Submit Application</>}
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
