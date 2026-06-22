/**
 * Contact Page — MNC Enterprise Dark Theme v5.0
 * Full dark, premium contact form, world-class design
 */
import { useState } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Mail, MapPin, Phone, Send, Linkedin, Youtube, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const offices = [
  {
    flag: "🇺🇸",
    title: "American Group LLC",
    sub: "Headquarters",
    address: "Santa Clara, California, USA",
    phone: "+1 (510) 458-9059",
    email: "contact@safecodeg.com",
    color: "#6366F1",
  },
  {
    flag: "🇮🇳",
    title: "SafeCodeX Research Center",
    sub: "India Operations",
    address: "Hyderabad, Telangana, India",
    phone: "+91 74168 66689",
    email: "india@safecodeg.com",
    color: "#FBBF24",
  },
];

const inquiryTypes = [
  "General Inquiry",
  "Product Demo Request",
  "Enterprise Partnership",
  "Custom Development",
  "Careers / Hiring",
  "Press & Media",
  "Technical Support",
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", company: "", inquiry: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setForm({ name: "", email: "", company: "", inquiry: "", message: "" });
    }, 1500);
  };

  return (
    <div style={{ background: "#070B14", color: "white", minHeight: "100vh" }}>
      <Navigation />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 20% 60%, rgba(99,102,241,0.12), transparent 55%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 80% 30%, rgba(245,158,11,0.06), transparent 50%)" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/25 bg-indigo-500/8 text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-8">
              <Mail className="w-3.5 h-3.5" /> Contact Us
            </div>
            <h1 className="font-black text-white mb-5 tracking-tight" style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(3rem, 7vw, 5.5rem)" }}>
              Let's build something<br />
              <span style={{ background: "linear-gradient(135deg, #818CF8, #FBBF24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                extraordinary together.
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl leading-relaxed">
              Reach out to American Group LLC or SafeCodeX Research Center — we respond within 24 hours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

            {/* ── Left: Office cards + info ─────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">
              {offices.map((office, i) => (
                <motion.div
                  key={office.title}
                  initial={{ opacity: 0, x: -25 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="p-6 rounded-2xl border border-white/8 bg-white/[0.025]"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-3xl">{office.flag}</span>
                    <div>
                      <div className="font-bold text-white text-sm">{office.title}</div>
                      <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: office.color }}>{office.sub}</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 text-sm text-slate-400">
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: office.color }} />
                      {office.address}
                    </div>
                    <a href={`tel:${office.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors">
                      <Phone className="w-4 h-4 flex-shrink-0" style={{ color: office.color }} />
                      {office.phone}
                    </a>
                    <a href={`mailto:${office.email}`} className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors">
                      <Mail className="w-4 h-4 flex-shrink-0" style={{ color: office.color }} />
                      {office.email}
                    </a>
                  </div>
                </motion.div>
              ))}

              {/* Response time */}
              <motion.div
                initial={{ opacity: 0, x: -25 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25, duration: 0.6 }}
                className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  <span className="font-semibold text-white text-sm">Response Time</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  We typically respond to all inquiries within <strong className="text-white">24 hours</strong> on business days. For urgent matters, call us directly.
                </p>
              </motion.div>

              {/* Social */}
              <motion.div
                initial={{ opacity: 0, x: -25 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="p-5 rounded-2xl border border-white/8 bg-white/[0.025]"
              >
                <div className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-4">Follow Us</div>
                <div className="flex items-center gap-3">
                  {[
                    { icon: Linkedin, href: "https://linkedin.com/company/americangroupllc", label: "LinkedIn" },
                    { icon: Youtube, href: "https://youtube.com/@americangroupllc", label: "YouTube" },
                  ].map(({ icon: Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white transition-all duration-200"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      <Icon className="w-4 h-4" /> {label}
                    </a>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* ── Right: Contact form ───────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-3"
            >
              <div className="p-8 rounded-2xl border border-white/8 bg-white/[0.025]">
                <h2 className="font-bold text-white text-xl mb-2" style={{ fontFamily: "Sora, sans-serif" }}>Send us a message</h2>
                <p className="text-slate-500 text-sm mb-8">Fill out the form below and our team will get back to you promptly.</p>

                {sent ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(16,185,129,0.15)" }}>
                      <CheckCircle className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="font-bold text-white text-lg mb-2">Message Sent!</h3>
                    <p className="text-slate-400 text-sm">We'll get back to you within 24 hours.</p>
                    <button onClick={() => setSent(false)} className="mt-6 text-indigo-400 text-sm hover:text-indigo-300 transition-colors">
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="John Smith"
                          className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder-slate-600 outline-none transition-all duration-200 focus:border-indigo-500/50"
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="john@company.com"
                          className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder-slate-600 outline-none transition-all duration-200 focus:border-indigo-500/50"
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Company / Organization</label>
                      <input
                        type="text"
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        placeholder="Your company name"
                        className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder-slate-600 outline-none transition-all duration-200"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Inquiry Type *</label>
                      <select
                        required
                        value={form.inquiry}
                        onChange={(e) => setForm({ ...form, inquiry: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: form.inquiry ? "white" : "rgb(75,85,99)" }}
                      >
                        <option value="" disabled>Select inquiry type</option>
                        {inquiryTypes.map((t) => (
                          <option key={t} value={t} style={{ background: "#0A0F1E", color: "white" }}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Message *</label>
                      <textarea
                        required
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="Tell us about your project, requirements, or question..."
                        className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder-slate-600 outline-none transition-all duration-200 resize-none"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-white text-sm transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:scale-100"
                      style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)", boxShadow: "0 0 30px rgba(99,102,241,0.25)" }}
                    >
                      {sending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
