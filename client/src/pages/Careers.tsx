/**
 * Careers Page — MNC Enterprise Dark Theme v5.0
 * Full dark, premium job listings, world-class design
 */
import { motion } from "framer-motion";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ArrowRight, MapPin, Clock, Briefcase, Code2, Brain, Shield, Smartphone, Globe, Zap, Star, Users, CheckCircle, Link2, Cpu } from "lucide-react";
import { toast } from "sonner";

const openings = [
  {
    title: "Senior AI/ML Engineer",
    dept: "Enterprise AI",
    location: "Santa Clara, CA / Remote",
    type: "Full-time",
    icon: Brain,
    color: "#818CF8",
    desc: "Build frontier AI systems including LLMs, RAG pipelines, and cognitive agents for enterprise deployments.",
    tags: ["Python", "PyTorch", "LLM", "RAG"],
  },
  {
    title: "iOS Developer (Swift)",
    dept: "Consumer Mobile",
    location: "India / Remote",
    type: "Full-time",
    icon: Smartphone,
    color: "#34D399",
    desc: "Build world-class iOS apps including on-device AI, Wear OS integration, and offline-first experiences.",
    tags: ["Swift", "SwiftUI", "CoreML", "Wear OS"],
  },
  {
    title: "Full-Stack Engineer (TypeScript)",
    dept: "FinTech",
    location: "Remote",
    type: "Full-time",
    icon: Code2,
    color: "#FBBF24",
    desc: "Build scalable FinTech platforms including digital banking, payment processing, and trading systems.",
    tags: ["TypeScript", "React", "Node.js", "PostgreSQL"],
  },
  {
    title: "Cybersecurity Engineer",
    dept: "CyberSecurity",
    location: "Remote",
    type: "Full-time",
    icon: Shield,
    color: "#F87171",
    desc: "Design and implement enterprise security systems including SIEM, threat hunting, and zero-trust architecture.",
    tags: ["Python", "SIEM", "Zero-Trust", "Kubernetes"],
  },
  {
    title: "Android Developer (Kotlin)",
    dept: "Consumer Mobile",
    location: "India / Remote",
    type: "Full-time",
    icon: Smartphone,
    color: "#60A5FA",
    desc: "Build native Android apps with Jetpack Compose, integrating ML Kit, Wear OS, and offline-first architecture.",
    tags: ["Kotlin", "Jetpack Compose", "ML Kit", "Wear OS"],
  },
  {
    title: "DevOps / Cloud Engineer",
    dept: "Infrastructure",
    location: "Remote",
    type: "Full-time",
    icon: Globe,
    color: "#A78BFA",
    desc: "Manage multi-cloud infrastructure, CI/CD pipelines, and Kubernetes clusters for 77+ production products.",
    tags: ["Kubernetes", "Terraform", "AWS", "GCP"],
  },
  // ── Internship Positions ──────────────────────────────────────────────
  {
    title: "AI / LLM Mobile App Intern",
    dept: "AI Mobile Internship",
    location: "Remote / India",
    type: "Internship · 3–6 months",
    icon: Cpu,
    color: "#F472B6",
    badge: "Internship",
    desc: "Build on-device AI features and LLM-powered mobile apps for iOS and Android. Work with GPT-4o, Gemini, and on-device models (CoreML / TFLite) to ship real AI features inside AGL consumer apps.",
    tags: ["Swift / Kotlin", "LLM APIs", "CoreML", "TFLite", "RAG", "Flutter"],
  },
  {
    title: "LLM & Generative AI Research Intern",
    dept: "AI Research Internship",
    location: "Remote",
    type: "Internship · 3–6 months",
    icon: Brain,
    color: "#34D399",
    badge: "Internship",
    desc: "Assist in fine-tuning, prompt engineering, and evaluation of large language models. Build RAG pipelines, vector search systems, and AI agent workflows using LangChain, LlamaIndex, and OpenAI APIs.",
    tags: ["Python", "LangChain", "OpenAI API", "Vector DB", "Fine-tuning", "Hugging Face"],
  },
  {
    title: "Blockchain & Web3 Developer Intern",
    dept: "Blockchain Internship",
    location: "Remote",
    type: "Internship · 3–6 months",
    icon: Link2,
    color: "#FBBF24",
    badge: "Internship",
    desc: "Develop and audit smart contracts on Ethereum and Solana. Build DeFi components, NFT systems, and Web3 wallet integrations. Contribute to AGL's blockchain product vertical including tokenization and on-chain identity.",
    tags: ["Solidity", "Rust", "Ethereum", "Solana", "Hardhat", "Web3.js"],
  },
  {
    title: "Blockchain Security & Audit Intern",
    dept: "Blockchain Internship",
    location: "Remote",
    type: "Internship · 3–6 months",
    icon: Shield,
    color: "#60A5FA",
    badge: "Internship",
    desc: "Learn smart contract security auditing, identify vulnerabilities (reentrancy, flash loans, oracle manipulation), and write security reports. Work alongside senior engineers on real DeFi protocol audits.",
    tags: ["Solidity", "Slither", "Foundry", "DeFi", "Security Auditing", "Python"],
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
  return (
    <div style={{ background: "#070B14", color: "white", minHeight: "100vh" }}>
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
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 20% 60%, rgba(99,102,241,0.12), transparent 55%)" }} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: "linear-gradient(to bottom, transparent, #070B14)" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/25 bg-indigo-500/8 text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-8">
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
      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/25 bg-amber-500/8 text-amber-300 text-xs font-semibold uppercase tracking-widest mb-6">
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
                  className="p-6 rounded-2xl border border-white/8 bg-white/[0.025] hover:bg-white/[0.04] transition-all duration-300"
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
      <section id="openings" className="py-28 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/25 bg-indigo-500/8 text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-6">
              Open Positions
            </div>
            <h2 className="font-black text-white tracking-tight" style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(2rem, 4vw, 3rem)" }}>
              Current openings
            </h2>
          </motion.div>

          {/* Full-time roles */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Full-Time Positions</span>
              <div className="flex-1 h-px bg-white/8" />
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">{openings.filter(j => !('badge' in j)).length} open</span>
            </div>
            <div className="space-y-4">
              {openings.filter(j => !('badge' in j)).map((job, i) => {
                const Icon = job.icon;
                return (
                  <motion.div
                    key={job.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07, duration: 0.6 }}
                    className="group flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-6 rounded-2xl border border-white/8 bg-white/[0.025] hover:bg-white/[0.04] hover:border-white/15 transition-all duration-300 cursor-pointer"
                    onClick={() => toast.info("Applications are currently managed via email. Please send your resume to careers@safecodeg.com")}
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
                      <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0" style={{ background: job.color + "20", color: job.color }}>
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
                    onClick={() => toast.info("Send your resume and a short intro to internships@safecodeg.com — include the role name in the subject line.")}
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
                      <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0" style={{ background: job.color + "20", color: job.color }}>
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
            className="mt-10 p-6 rounded-2xl border border-white/8 bg-white/[0.025] text-center"
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

      <Footer />
    </div>
  );
}
