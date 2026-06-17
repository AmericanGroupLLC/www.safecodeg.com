/**
 * Products Page — Full 77-product portfolio
 * Filterable by vertical, with product cards
 */
import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ExternalLink, Github, Play } from "lucide-react";
import { toast } from "sonner";

function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }); },
      { threshold: 0.05, rootMargin: "0px 0px -20px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  });
}

type Product = {
  emoji: string;
  name: string;
  type: string;
  desc: string;
  tags: string[];
  badge: string;
  vertical: string;
};

const allProducts: Product[] = [
  // Enterprise AI & DevTools (14)
  { emoji: "🧠", name: "CogniCore AI Platform", type: "Umbrella Platform", desc: "Umbrella monorepo consolidating cognitive AI services. Cognitive reasoning, tool-augmented agents, and multi-modal intelligence pipelines.", tags: ["Python", "LLM", "RAG", "Agents"], badge: "ENTERPRISE", vertical: "Enterprise AI & DevTools" },
  { emoji: "🔬", name: "Thinking Machines Lab", type: "Frontier Research", desc: "Frontier AI research platform exploring machine intelligence boundaries. Hosts experiments in reasoning, memory, and multi-agent coordination.", tags: ["Python", "Research", "AI/ML"], badge: "R&D", vertical: "Enterprise AI & DevTools" },
  { emoji: "⚙️", name: "Cognission AI", type: "Cognitive Agents", desc: "Cognitive reasoning and tool-augmented agents. Builds autonomous AI agents capable of multi-step reasoning and complex task decomposition.", tags: ["Python", "Agents", "Tool Use"], badge: "AI PLATFORM", vertical: "Enterprise AI & DevTools" },
  { emoji: "📄", name: "DocStream Enterprise", type: "Document Pipeline", desc: "Enterprise document streaming pipeline with AI-powered extraction, classification, and routing for high-volume document streams.", tags: ["Python", "FastAPI", "NLP"], badge: "ENTERPRISE", vertical: "Enterprise AI & DevTools" },
  { emoji: "🗄️", name: "DataCore Enterprise", type: "Data Platform", desc: "Enterprise-grade data platform centralizing ingestion, transformation, storage, and analytics across the AGL portfolio.", tags: ["Python", "Data", "Analytics"], badge: "PLATFORM", vertical: "Enterprise AI & DevTools" },
  { emoji: "🏗️", name: "InfraForge Enterprise", type: "Infrastructure", desc: "Enterprise infrastructure automation and orchestration platform managing provisioning, scaling, and lifecycle of cloud and on-premise resources.", tags: ["Python", "IaC", "Cloud"], badge: "INFRA", vertical: "Enterprise AI & DevTools" },
  { emoji: "🎵", name: "AudioSphere Suite", type: "Audio AI", desc: "Umbrella suite for audio intelligence covering speech recognition, synthesis, music generation, and spatial audio processing.", tags: ["Python", "Audio AI", "TTS/STT"], badge: "SUITE", vertical: "Enterprise AI & DevTools" },
  { emoji: "📊", name: "Productivity Suite", type: "Productivity Platform", desc: "Comprehensive productivity platform integrating task management, document collaboration, and AI-powered workflow automation.", tags: ["Python", "SaaS", "Workflow"], badge: "SUITE", vertical: "Enterprise AI & DevTools" },
  { emoji: "🌐", name: "AI Vertical Platform Suite", type: "AI SaaS", desc: "Umbrella monorepo for AI-powered vertical SaaS products with shared AI infrastructure, model serving, and API gateways.", tags: ["Python", "AI SaaS", "APIs"], badge: "PLATFORM", vertical: "Enterprise AI & DevTools" },
  { emoji: "💬", name: "Verba", type: "AI Chat & Language", desc: "Multilingual conversational AI with real-time translation, context-aware responses, and cross-platform Flutter delivery.", tags: ["Dart", "Flutter", "NLP", "Chat"], badge: "MOBILE + WEB", vertical: "Enterprise AI & DevTools" },
  { emoji: "✍️", name: "AGrammarly", type: "Writing AI", desc: "AI-powered writing assistant providing real-time suggestions, style improvements, and tone adjustments for professional writing.", tags: ["TypeScript", "NLP", "Writing AI"], badge: "TOOL", vertical: "Enterprise AI & DevTools" },
  { emoji: "🎨", name: "AGStudio", type: "Creative Studio", desc: "AI-powered creative studio for design, prototyping, and content generation combining generative AI with professional design tools.", tags: ["TypeScript", "Generative AI", "Design"], badge: "STUDIO", vertical: "Enterprise AI & DevTools" },
  { emoji: "🎓", name: "CareerUpgrade AI", type: "Career AI", desc: "AI-powered career development platform providing personalized learning paths, resume optimization, and interview coaching.", tags: ["TypeScript", "AI", "EdTech"], badge: "SAAS", vertical: "Enterprise AI & DevTools" },
  { emoji: "🤖", name: "LifeAdmin AI", type: "Personal AI", desc: "AI-powered personal life administration assistant automating scheduling, bill management, and life logistics.", tags: ["TypeScript", "AI", "Automation"], badge: "CONSUMER AI", vertical: "Enterprise AI & DevTools" },
  // Consumer Mobile (22)
  { emoji: "❤️", name: "MyHealth", type: "Health & Fitness OS", desc: "Personal fitness OS for Android & Wear OS covering training, cardio, nutrition, sleep, mindfulness, and AI coaching.", tags: ["Swift", "Android", "Wear OS", "HealthKit"], badge: "TIER 1", vertical: "Consumer Mobile" },
  { emoji: "⌚", name: "VirtuBand", type: "Wearable", desc: "Smart wearable companion app with advanced health analytics, real-time biometric tracking, and personalized insights.", tags: ["TypeScript", "Wearable", "BLE"], badge: "MOBILE", vertical: "Consumer Mobile" },
  { emoji: "🏙️", name: "NearServe", type: "Local Services", desc: "React Native consumer app connecting users with local services and urban needs. Hyperlocal service discovery with real-time availability.", tags: ["React Native", "iOS", "Android", "GPS"], badge: "MOBILE", vertical: "Consumer Mobile" },
  { emoji: "🧠", name: "Local Buddy", type: "On-Device AI", desc: "On-device offline AI chat app running LLMs entirely on-device with no internet required. Private, fast, and always available.", tags: ["Swift", "On-Device AI", "Offline", "LLM"], badge: "IOS", vertical: "Consumer Mobile" },
  { emoji: "📡", name: "Offline Buddy", type: "On-Device LLM", desc: "On-device LLM assistant with chat, voice, translator, and smart-reply keyboard. Works fully offline after one-time model download.", tags: ["Swift", "LLM", "Voice", "Offline"], badge: "IOS", vertical: "Consumer Mobile" },
  { emoji: "🎮", name: "BuddyPlay", type: "Offline Multiplayer", desc: "Native Android offline multiplayer party games. P2P over Wi-Fi, Hotspot, and BLE — works in subway tunnels and offline environments.", tags: ["Swift", "P2P", "BLE", "Multiplayer"], badge: "GAMING", vertical: "Consumer Mobile" },
  { emoji: "🧹", name: "AGCleaner", type: "System Optimizer", desc: "Cross-platform memory cleaner, storage optimizer, and system performance booster for Android and iOS.", tags: ["TypeScript", "Android", "iOS"], badge: "UTILITY", vertical: "Consumer Mobile" },
  { emoji: "📸", name: "SnapEdit Pro", type: "Photo Editor", desc: "AI-powered photo editing app with smart filters, background removal, and one-tap enhancements.", tags: ["Swift", "AI", "Photos"], badge: "CREATIVE", vertical: "Consumer Mobile" },
  { emoji: "🎙️", name: "PodcastKit", type: "Podcast Platform", desc: "All-in-one podcast creation, editing, and distribution platform for mobile creators.", tags: ["React Native", "Audio", "Creator"], badge: "MEDIA", vertical: "Consumer Mobile" },
  { emoji: "🗺️", name: "TripForge", type: "Travel Planner", desc: "AI-powered travel planning app with itinerary generation, booking integration, and offline maps.", tags: ["Flutter", "AI", "Travel"], badge: "LIFESTYLE", vertical: "Consumer Mobile" },
  { emoji: "🍽️", name: "MealMind", type: "Nutrition AI", desc: "AI-powered meal planning and nutrition tracking with personalized diet recommendations.", tags: ["Swift", "AI", "Health"], badge: "HEALTH", vertical: "Consumer Mobile" },
  { emoji: "💪", name: "GymGenius", type: "Fitness Coach", desc: "AI personal trainer app with form analysis, workout generation, and progress tracking.", tags: ["Android", "AI", "Fitness"], badge: "FITNESS", vertical: "Consumer Mobile" },
  { emoji: "📚", name: "ReadWise Mobile", type: "Reading App", desc: "Smart reading app with AI summaries, highlights sync, and spaced repetition for book learning.", tags: ["React Native", "AI", "Education"], badge: "EDUCATION", vertical: "Consumer Mobile" },
  { emoji: "🎵", name: "BeatCraft", type: "Music Creator", desc: "Mobile music production studio with AI beat generation, mixing, and social sharing.", tags: ["Swift", "Audio AI", "Creator"], badge: "CREATIVE", vertical: "Consumer Mobile" },
  { emoji: "🧘", name: "MindSpace", type: "Wellness App", desc: "Mindfulness and meditation app with guided sessions, sleep stories, and stress tracking.", tags: ["Flutter", "Wellness", "Audio"], badge: "WELLNESS", vertical: "Consumer Mobile" },
  { emoji: "🐾", name: "PetPal", type: "Pet Care", desc: "Comprehensive pet care app with health tracking, vet finder, and AI symptom checker.", tags: ["React Native", "AI", "Lifestyle"], badge: "LIFESTYLE", vertical: "Consumer Mobile" },
  { emoji: "🏠", name: "HomeSync", type: "Smart Home", desc: "Unified smart home control app supporting 200+ device types with AI automation rules.", tags: ["Flutter", "IoT", "Smart Home"], badge: "IOT", vertical: "Consumer Mobile" },
  { emoji: "💼", name: "FreelanceHub", type: "Freelancer Platform", desc: "Mobile-first platform for freelancers to find work, manage projects, and get paid.", tags: ["React Native", "FinTech", "Marketplace"], badge: "PLATFORM", vertical: "Consumer Mobile" },
  { emoji: "🎯", name: "GoalStack", type: "Habit Tracker", desc: "Science-backed habit tracking and goal achievement app with AI coaching and streak analytics.", tags: ["Swift", "AI", "Productivity"], badge: "PRODUCTIVITY", vertical: "Consumer Mobile" },
  { emoji: "🌍", name: "LinguaLeap", type: "Language Learning", desc: "AI-powered language learning app with conversation practice, pronunciation coaching, and cultural context.", tags: ["Flutter", "AI", "Education"], badge: "EDUCATION", vertical: "Consumer Mobile" },
  { emoji: "🔔", name: "NotifyPro", type: "Smart Notifications", desc: "AI-powered notification management app that filters, prioritizes, and summarizes your alerts.", tags: ["Android", "AI", "Utility"], badge: "UTILITY", vertical: "Consumer Mobile" },
  { emoji: "📱", name: "AppVault", type: "App Manager", desc: "Advanced app manager with usage analytics, privacy scanner, and storage optimizer.", tags: ["Android", "Privacy", "Utility"], badge: "UTILITY", vertical: "Consumer Mobile" },
  // FinTech (12)
  { emoji: "🏦", name: "NeoBank Pro", type: "Digital Banking", desc: "Full-featured digital banking platform with AI-powered insights, instant transfers, and smart savings.", tags: ["TypeScript", "FinTech", "Banking"], badge: "FINTECH", vertical: "FinTech & E-Commerce" },
  { emoji: "💳", name: "PayStream", type: "Payment Processing", desc: "Enterprise payment processing platform supporting 50+ payment methods with real-time fraud detection.", tags: ["Python", "Payments", "API"], badge: "ENTERPRISE", vertical: "FinTech & E-Commerce" },
  { emoji: "🔐", name: "CryptoVault", type: "Crypto Wallet", desc: "Multi-chain cryptocurrency wallet with DeFi integration, staking, and hardware wallet support.", tags: ["TypeScript", "Blockchain", "DeFi"], badge: "WEB3", vertical: "FinTech & E-Commerce" },
  { emoji: "📈", name: "TradeSphere", type: "Trading Platform", desc: "AI-powered trading platform with algorithmic strategies, portfolio analytics, and real-time market data.", tags: ["Python", "AI", "Trading"], badge: "TRADING", vertical: "FinTech & E-Commerce" },
  { emoji: "🛒", name: "ShopForge", type: "E-Commerce Platform", desc: "Headless e-commerce platform with AI recommendations, inventory management, and multi-channel selling.", tags: ["TypeScript", "E-Commerce", "AI"], badge: "COMMERCE", vertical: "FinTech & E-Commerce" },
  { emoji: "📋", name: "InvoiceAI", type: "Invoice Automation", desc: "AI-powered invoice processing, expense tracking, and accounts payable automation for SMBs.", tags: ["Python", "AI", "Finance"], badge: "SAAS", vertical: "FinTech & E-Commerce" },
  { emoji: "💰", name: "BudgetBrain", type: "Personal Finance", desc: "AI financial advisor app with budget tracking, investment recommendations, and debt payoff planning.", tags: ["React Native", "AI", "Finance"], badge: "CONSUMER", vertical: "FinTech & E-Commerce" },
  { emoji: "🌐", name: "RemitFlow", type: "International Transfers", desc: "Low-cost international money transfer platform with real-time exchange rates and compliance automation.", tags: ["TypeScript", "FinTech", "Global"], badge: "FINTECH", vertical: "FinTech & E-Commerce" },
  { emoji: "📊", name: "EquityTrack", type: "Cap Table Management", desc: "Startup equity and cap table management platform with scenario modeling and investor reporting.", tags: ["TypeScript", "FinTech", "Startup"], badge: "B2B", vertical: "FinTech & E-Commerce" },
  { emoji: "🤝", name: "LendBridge", type: "P2P Lending", desc: "Peer-to-peer lending marketplace with AI credit scoring, automated underwriting, and loan servicing.", tags: ["Python", "AI", "Lending"], badge: "FINTECH", vertical: "FinTech & E-Commerce" },
  { emoji: "🎁", name: "RewardEngine", type: "Loyalty Platform", desc: "Enterprise loyalty and rewards platform with gamification, points management, and partner integrations.", tags: ["TypeScript", "Loyalty", "B2B"], badge: "PLATFORM", vertical: "FinTech & E-Commerce" },
  { emoji: "📦", name: "SupplyChainAI", type: "Supply Chain", desc: "AI-powered supply chain optimization platform with demand forecasting, inventory optimization, and logistics.", tags: ["Python", "AI", "Logistics"], badge: "ENTERPRISE", vertical: "FinTech & E-Commerce" },
  // CyberSecurity (11)
  { emoji: "🛡️", name: "SecureCore", type: "Security Platform", desc: "Enterprise security operations platform with SIEM, threat hunting, and automated incident response.", tags: ["Python", "Security", "SIEM"], badge: "ENTERPRISE", vertical: "CyberSecurity & Infra" },
  { emoji: "👁️", name: "ThreatWatch", type: "Threat Intelligence", desc: "Real-time threat intelligence platform aggregating global threat feeds with AI-powered analysis.", tags: ["Python", "AI", "Threat Intel"], badge: "SECURITY", vertical: "CyberSecurity & Infra" },
  { emoji: "🔒", name: "ZeroTrust Gateway", type: "Zero Trust", desc: "Enterprise zero-trust network access solution with identity-aware proxying and continuous verification.", tags: ["Go", "Zero Trust", "IAM"], badge: "ENTERPRISE", vertical: "CyberSecurity & Infra" },
  { emoji: "☁️", name: "CloudArmor", type: "Cloud Security", desc: "Multi-cloud security posture management with compliance automation and misconfiguration detection.", tags: ["Python", "Cloud", "Compliance"], badge: "CLOUD", vertical: "CyberSecurity & Infra" },
  { emoji: "🗝️", name: "VaultOS", type: "Secrets Management", desc: "Enterprise secrets management and PKI platform with hardware security module integration.", tags: ["Go", "Security", "PKI"], badge: "INFRA", vertical: "CyberSecurity & Infra" },
  { emoji: "🔍", name: "SecAudit", type: "Security Auditing", desc: "Automated security auditing platform for code, infrastructure, and compliance with AI-powered remediation.", tags: ["Python", "AI", "Audit"], badge: "DEVSECOPS", vertical: "CyberSecurity & Infra" },
  { emoji: "🌐", name: "NetGuard", type: "Network Security", desc: "Next-generation network security platform with deep packet inspection and behavioral analytics.", tags: ["C++", "Network", "DPI"], badge: "SECURITY", vertical: "CyberSecurity & Infra" },
  { emoji: "📱", name: "MobileShield", type: "Mobile Security", desc: "Enterprise mobile device management with threat detection, app vetting, and remote wipe capabilities.", tags: ["Swift", "Android", "MDM"], badge: "MOBILE", vertical: "CyberSecurity & Infra" },
  { emoji: "🔐", name: "IdentityForge", type: "Identity Platform", desc: "Unified identity and access management platform with SSO, MFA, and privileged access management.", tags: ["TypeScript", "IAM", "SSO"], badge: "PLATFORM", vertical: "CyberSecurity & Infra" },
  { emoji: "🕵️", name: "PenTestKit", type: "Penetration Testing", desc: "Automated penetration testing platform with AI-guided attack simulation and detailed reporting.", tags: ["Python", "Security", "Red Team"], badge: "SECURITY", vertical: "CyberSecurity & Infra" },
  { emoji: "📋", name: "ComplianceAI", type: "Compliance Automation", desc: "AI-powered compliance management for SOC2, ISO 27001, GDPR, and HIPAA with continuous monitoring.", tags: ["Python", "AI", "Compliance"], badge: "GOVERNANCE", vertical: "CyberSecurity & Infra" },
  // Spatial & Industry SaaS (10)
  { emoji: "🥽", name: "SpaceForge AR", type: "AR Platform", desc: "Enterprise AR development platform for industrial training, remote assistance, and spatial computing applications.", tags: ["Swift", "ARKit", "Unity"], badge: "AR/VR", vertical: "Spatial & Industry SaaS" },
  { emoji: "🏥", name: "MedSpatial", type: "Healthcare AR", desc: "Spatial computing platform for medical visualization, surgical planning, and patient education.", tags: ["Swift", "ARKit", "Healthcare"], badge: "HEALTHTECH", vertical: "Spatial & Industry SaaS" },
  { emoji: "🌐", name: "RealityLayer", type: "Spatial OS", desc: "Operating system for spatial computing environments bridging physical and digital worlds.", tags: ["Swift", "visionOS", "Spatial"], badge: "PLATFORM", vertical: "Spatial & Industry SaaS" },
  { emoji: "🏭", name: "IndustrialAR", type: "Industrial AR", desc: "AR-powered industrial maintenance, inspection, and training platform for manufacturing environments.", tags: ["Unity", "AR", "Industrial"], badge: "ENTERPRISE", vertical: "Spatial & Industry SaaS" },
  { emoji: "🎰", name: "CasinoOS", type: "Casino Platform", desc: "Full-stack casino floor operating system with real-time analytics, compliance, and player management.", tags: ["TypeScript", "Real-time", "Gaming"], badge: "INDUSTRY", vertical: "Spatial & Industry SaaS" },
  { emoji: "🏙️", name: "UrbanMesh", type: "Smart City Platform", desc: "Smart city data platform aggregating IoT sensors, traffic, utilities, and public services.", tags: ["Python", "IoT", "Smart City"], badge: "GOV TECH", vertical: "Spatial & Industry SaaS" },
  { emoji: "🏗️", name: "ConstructIQ", type: "Construction SaaS", desc: "AI-powered construction project management with BIM integration, safety monitoring, and progress tracking.", tags: ["TypeScript", "AI", "Construction"], badge: "INDUSTRY", vertical: "Spatial & Industry SaaS" },
  { emoji: "🌾", name: "AgriSense", type: "AgriTech Platform", desc: "Precision agriculture platform with drone integration, soil analytics, and AI crop optimization.", tags: ["Python", "AI", "AgriTech"], badge: "AGRITECH", vertical: "Spatial & Industry SaaS" },
  { emoji: "⚡", name: "EnergyGrid AI", type: "Energy Management", desc: "AI-powered energy grid management platform for utilities with demand forecasting and optimization.", tags: ["Python", "AI", "Energy"], badge: "CLEANTECH", vertical: "Spatial & Industry SaaS" },
  { emoji: "🚚", name: "LogiTrack", type: "Logistics Platform", desc: "Real-time logistics and fleet management platform with AI route optimization and predictive maintenance.", tags: ["TypeScript", "AI", "Logistics"], badge: "LOGISTICS", vertical: "Spatial & Industry SaaS" },
  // IoT & Hardware (8)
  { emoji: "🔌", name: "EdgeNode", type: "Edge Computing", desc: "Edge computing runtime for IoT devices with containerized workloads and OTA update management.", tags: ["C++", "Edge", "IoT"], badge: "EDGE", vertical: "IoT & Hardware" },
  { emoji: "🏠", name: "SmartHome OS", type: "Home Automation", desc: "Open-source smart home operating system supporting 500+ device protocols with local processing.", tags: ["Python", "IoT", "Home Automation"], badge: "OPEN SOURCE", vertical: "IoT & Hardware" },
  { emoji: "📡", name: "SensorMesh", type: "Sensor Network", desc: "Distributed sensor network platform with real-time data aggregation, anomaly detection, and visualization.", tags: ["C++", "MQTT", "Sensors"], badge: "PLATFORM", vertical: "IoT & Hardware" },
  { emoji: "🔧", name: "FirmwareForge", type: "Firmware Platform", desc: "Cross-platform firmware development and OTA update platform for embedded systems.", tags: ["C", "Embedded", "OTA"], badge: "EMBEDDED", vertical: "IoT & Hardware" },
  { emoji: "🌐", name: "IoTGateway", type: "IoT Gateway", desc: "Universal IoT gateway supporting MQTT, CoAP, HTTP, and LoRaWAN with cloud bridge capabilities.", tags: ["Go", "IoT", "Gateway"], badge: "INFRA", vertical: "IoT & Hardware" },
  { emoji: "🛠️", name: "HardwareKit", type: "Hardware SDK", desc: "SDK and toolchain for rapid hardware prototype development with simulation and testing tools.", tags: ["C++", "SDK", "Hardware"], badge: "SDK", vertical: "IoT & Hardware" },
  { emoji: "🤖", name: "RoboCore", type: "Robotics Platform", desc: "Robotics control and simulation platform with ROS integration and AI-powered motion planning.", tags: ["Python", "ROS", "Robotics"], badge: "ROBOTICS", vertical: "IoT & Hardware" },
  { emoji: "🔋", name: "PowerSense", type: "Energy Monitoring", desc: "Smart energy monitoring hardware and software platform for buildings and industrial facilities.", tags: ["C++", "Energy", "IoT"], badge: "HARDWARE", vertical: "IoT & Hardware" },
];

const verticalFilters = [
  "All Verticals",
  "Enterprise AI & DevTools",
  "Consumer Mobile",
  "FinTech & E-Commerce",
  "CyberSecurity & Infra",
  "Spatial & Industry SaaS",
  "IoT & Hardware",
];

const verticalColors: Record<string, string> = {
  "Enterprise AI & DevTools": "oklch(0.52 0.22 270)",
  "Consumer Mobile": "oklch(0.72 0.14 165)",
  "FinTech & E-Commerce": "oklch(0.78 0.18 75)",
  "CyberSecurity & Infra": "oklch(0.55 0.18 30)",
  "Spatial & Industry SaaS": "oklch(0.65 0.16 310)",
  "IoT & Hardware": "oklch(0.60 0.15 200)",
};

export default function ProductsPage() {
  const [activeFilter, setActiveFilter] = useState("All Verticals");
  useReveal();

  const filtered = activeFilter === "All Verticals"
    ? allProducts
    : allProducts.filter((p) => p.vertical === activeFilter);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero */}
      <section className="pt-28 pb-16" style={{ background: "oklch(0.14 0.04 255)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-xs font-mono font-semibold uppercase tracking-widest text-white/40 mb-3">Product Portfolio</div>
          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            77 products.
            <br />
            <span style={{ color: "oklch(0.78 0.18 75)" }}>Zero compromises.</span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl">
            Browse the complete American Group LLC product portfolio across 6 business verticals — all actively developed and maintained.
          </p>
        </div>
        <div className="absolute left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 40L1440 0V40H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Filter + Grid */}
      <section className="py-16 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 mb-10 reveal">
            {verticalFilters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all btn-press ${
                  activeFilter === f
                    ? "text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                style={activeFilter === f ? { background: "oklch(0.52 0.22 270)" } : {}}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Count */}
          <div className="text-sm font-mono text-slate-400 mb-6 reveal">
            Showing {filtered.length} products
            {activeFilter !== "All Verticals" && ` in ${activeFilter}`}
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((product, i) => {
              const color = verticalColors[product.vertical] || "oklch(0.52 0.22 270)";
              return (
                <div
                  key={product.name}
                  className="reveal product-card p-5 rounded-2xl border border-slate-100 bg-white flex flex-col"
                  style={{ transitionDelay: `${(i % 8) * 40}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">{product.emoji}</div>
                    <span
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold"
                      style={{ background: `${color.replace(")", " / 0.1)")}`, color }}
                    >
                      {product.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">{product.name}</h3>
                  <div className="text-xs text-slate-400 font-mono mb-2">{product.type}</div>
                  <p className="text-xs text-slate-600 leading-relaxed flex-1 mb-3">{product.desc}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-md text-[10px] bg-slate-50 text-slate-500 border border-slate-100">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-auto">
                    <button
                      onClick={() => toast.info("GitHub repository coming soon!")}
                      className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      <Github className="h-3.5 w-3.5" /> GitHub
                    </button>
                    <button
                      onClick={() => toast.info("Simulator launching soon!")}
                      className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      <Play className="h-3.5 w-3.5" /> Simulator
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
