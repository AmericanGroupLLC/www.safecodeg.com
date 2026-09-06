/**
 * Product Detail Page — Individual product marketing page
 * Design: Dark enterprise, cinematic hero, feature grid, CTA
 */
import { useParams, Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Smartphone, Globe, Monitor, Watch, CheckCircle, Download, Star, ArrowRight, Shield, Zap, Users, TrendingUp } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
// T-014: value import of DIMENSION_LEVEL_META is safe here — `@/dimensions/contract`
// has zero imports of its own (see its header comment), so this does not pull
// the three.js runtime into this route's chunk. Never import a value from
// anywhere else under `@/dimensions`.
import { DIMENSION_LEVEL_META, type DimensionLevel } from '@/dimensions/contract';

type ProductCategory =
  | 'Enterprise AI & DevTools'
  | 'Consumer Mobile'
  | 'FinTech & E-Commerce'
  | 'CyberSecurity & Infra'
  | 'Travel & Aviation'
  | 'Health & Wellness'
  | 'E-Commerce & Deals'
  | 'Social & Lifestyle';

interface ProductData {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  category: ProductCategory;
  platforms: string[];
  tags: string[];
  color: string;
  icon: string;
  status: 'Live' | 'Beta' | 'Coming Soon';
  features: { title: string; description: string; icon: string }[];
  useCases: string[];
  stats?: { value: string; label: string }[];
  appStoreUrl?: string;
  playStoreUrl?: string;
  /**
   * T-014 / OQ-3 (TASKS.md Decisions, 2026-09-05): assigned ONLY where
   * evidence of the specific capability in `DIMENSION_LEVEL_META` already
   * exists in this repository. None of the 9 entries below set this field
   * today — see this task's Notes for the per-product grep review.
   * `generateFallbackProduct` below MUST NEVER set this field — a synthesised
   * page cannot carry a verified technical capability claim.
   */
  dimensionLevel?: DimensionLevel;
}

export const productDatabase: Record<string, ProductData> = {
  cognicore: {
    slug: 'cognicore', name: 'CogniCore AI Platform', tagline: 'Umbrella cognitive AI services platform', description: 'Consolidates cognitive AI services for enterprise deployments.', longDescription: 'CogniCore AI Platform is the flagship enterprise AI infrastructure powering the entire AGL product portfolio. It consolidates cognitive reasoning, tool-augmented agents, and multi-modal intelligence pipelines into a single, scalable platform that enterprise teams can deploy in hours, not months.', category: 'Enterprise AI & DevTools', platforms: ['Web'], tags: ['Python', 'LLM', 'RAG', 'Agents'], color: '#6366F1', icon: '🧠', status: 'Beta',
    features: [
      { title: 'Cognitive Reasoning Engine', description: 'Multi-step reasoning chains with tool augmentation for complex enterprise workflows.', icon: '🧩' },
      { title: 'RAG Pipeline', description: 'Retrieval-Augmented Generation with enterprise document stores, vector databases, and custom knowledge bases.', icon: '📚' },
      { title: 'Multi-Agent Coordination', description: 'Orchestrate multiple AI agents working in parallel to solve complex, multi-domain problems.', icon: '🤝' },
      { title: 'Multi-Modal Intelligence', description: 'Process text, images, audio, and structured data in unified intelligence pipelines.', icon: '🎯' },
      { title: 'Enterprise Security', description: 'SOC 2 compliant with role-based access control, audit logging, and data residency options.', icon: '🔒' },
      { title: 'API-First Architecture', description: 'RESTful and GraphQL APIs with SDKs for Python, TypeScript, and Go.', icon: '⚡' },
    ],
    useCases: ['Automate document processing pipelines', 'Build intelligent customer service agents', 'Power internal knowledge management systems', 'Accelerate research and analysis workflows'],
    stats: [{ value: '10x', label: 'Faster Deployment' }, { value: '99.9%', label: 'Uptime SLA' }, { value: '50+', label: 'Integrations' }],
  },
  verba: {
    slug: 'verba', name: 'Verba', tagline: 'Multilingual conversational AI', description: 'Real-time translation and context-aware AI chat.', longDescription: 'Verba breaks language barriers with state-of-the-art multilingual AI. Whether you\'re building a global customer support system or a cross-cultural communication tool, Verba delivers context-aware, culturally sensitive conversations in 50+ languages with near-human fluency.', category: 'Enterprise AI & DevTools', platforms: ['iOS', 'Android', 'Web'], tags: ['Flutter', 'NLP', 'Chat', 'AI'], color: '#8B5CF6', icon: '💬', status: 'Beta',
    features: [
      { title: '50+ Languages', description: 'Real-time translation and conversation in over 50 languages with dialect support.', icon: '🌍' },
      { title: 'Context-Aware Responses', description: 'Maintains conversation context across sessions for natural, flowing dialogue.', icon: '🧠' },
      { title: 'Cross-Platform', description: 'Native iOS, Android, and web apps built with Flutter for pixel-perfect consistency.', icon: '📱' },
      { title: 'Custom Personas', description: 'Configure AI personality, tone, and domain expertise for your specific use case.', icon: '🎭' },
      { title: 'Voice Integration', description: 'Built-in speech-to-text and text-to-speech for fully voice-driven conversations.', icon: '🎙️' },
      { title: 'Analytics Dashboard', description: 'Conversation analytics, sentiment tracking, and user engagement metrics.', icon: '📊' },
    ],
    useCases: ['Global customer support automation', 'Multilingual content creation', 'Cross-border business communication', 'Language learning applications'],
    stats: [{ value: '50+', label: 'Languages' }, { value: '<200ms', label: 'Response Time' }, { value: '98%', label: 'Accuracy' }],
  },
  myhealth: {
    slug: 'myhealth', name: 'MyHealth', tagline: 'Personal fitness OS for Android & Wear OS', description: 'Complete fitness and wellness platform.', longDescription: 'MyHealth is the most comprehensive personal fitness operating system available on Android and Wear OS. It unifies training, cardio, nutrition, sleep tracking, mindfulness, and AI coaching into a single, beautifully designed app that adapts to your unique health journey.', category: 'Health & Wellness', platforms: ['Android', 'Wear OS', 'iOS'], tags: ['Android', 'Wear OS', 'HealthKit', 'AI'], color: '#EF4444', icon: '❤️', status: 'Live',
    features: [
      { title: 'AI Personal Coach', description: 'Adaptive workout plans and real-time form feedback powered by computer vision AI.', icon: '🤖' },
      { title: 'Wear OS Integration', description: 'Seamless sync with Wear OS smartwatches for continuous biometric monitoring.', icon: '⌚' },
      { title: 'Nutrition Tracking', description: 'AI-powered food recognition with a database of 5M+ foods and meal planning.', icon: '🥗' },
      { title: 'Sleep Intelligence', description: 'Advanced sleep stage analysis with personalized recommendations for better rest.', icon: '😴' },
      { title: 'Mindfulness Suite', description: 'Guided meditation, breathing exercises, and stress management tools.', icon: '🧘' },
      { title: 'Health Insights', description: 'Weekly health reports with trend analysis and predictive health recommendations.', icon: '📈' },
    ],
    useCases: ['Personal fitness tracking', 'Corporate wellness programs', 'Physical therapy monitoring', 'Sports performance optimization'],
    stats: [{ value: '5M+', label: 'Food Database' }, { value: '200+', label: 'Workouts' }, { value: '24/7', label: 'Monitoring' }],
    playStoreUrl: 'https://play.google.com/store',
  },
  aeroswift: {
    slug: 'aeroswift', name: 'AeroSwift', tagline: 'Real-time flight tracking & aviation data', description: 'Comprehensive flight tracking and aviation intelligence.', longDescription: 'AeroSwift delivers professional-grade aviation intelligence to travelers, aviation enthusiasts, and industry professionals. With live aircraft positions updated every 5 seconds, comprehensive delay predictions, and gate-level information, AeroSwift is the most accurate flight tracking app available.', category: 'Travel & Aviation', platforms: ['iOS', 'Android'], tags: ['Aviation', 'Travel', 'Real-time'], color: '#3B82F6', icon: '✈️', status: 'Live',
    features: [
      { title: 'Live Flight Tracking', description: 'Real-time aircraft positions updated every 5 seconds from global ADS-B networks.', icon: '📡' },
      { title: 'Delay Intelligence', description: 'AI-powered delay predictions based on historical patterns, weather, and airport congestion.', icon: '⏱️' },
      { title: 'Gate Information', description: 'Real-time gate assignments, terminal maps, and walking time estimates.', icon: '🚶' },
      { title: 'Aviation Weather', description: 'METARs, TAFs, and graphical weather overlays for all airports worldwide.', icon: '🌤️' },
      { title: 'Flight Alerts', description: 'Instant push notifications for gate changes, delays, cancellations, and boarding.', icon: '🔔' },
      { title: 'Trip Management', description: 'Automatically import trips from email and calendar with smart flight detection.', icon: '📅' },
    ],
    useCases: ['Business traveler flight monitoring', 'Family member flight tracking', 'Aviation enthusiast spotting', 'Airport operations awareness'],
    stats: [{ value: '100K+', label: 'Flights Tracked Daily' }, { value: '5s', label: 'Update Interval' }, { value: '1,000+', label: 'Airports' }],
    appStoreUrl: 'https://apps.apple.com',
    playStoreUrl: 'https://play.google.com/store',
  },
  buddyplay: {
    slug: 'buddyplay', name: 'BuddyPlay', tagline: 'Offline multiplayer party games', description: 'P2P multiplayer games without internet.', longDescription: 'BuddyPlay solves the #1 problem with mobile gaming: you need the internet. Using cutting-edge P2P networking over Wi-Fi Direct, Hotspot, and Bluetooth Low Energy, BuddyPlay lets you play multiplayer party games anywhere — on planes, in basements, at campsites, or anywhere without connectivity.', category: 'Social & Lifestyle', platforms: ['Android'], tags: ['Android', 'P2P', 'BLE', 'Gaming'], color: '#8B5CF6', icon: '🎮', status: 'Live',
    features: [
      { title: 'Zero Internet Required', description: 'Full multiplayer experience using Wi-Fi Direct, Hotspot, and BLE mesh networking.', icon: '📵' },
      { title: '20+ Party Games', description: 'Trivia, drawing games, word games, and party challenges for 2-8 players.', icon: '🎲' },
      { title: 'Instant Connect', description: 'Discover and connect to nearby players in under 3 seconds with no setup required.', icon: '⚡' },
      { title: 'Voice Chat', description: 'Peer-to-peer voice chat over local network for real-time banter during games.', icon: '🎙️' },
      { title: 'Custom Games', description: 'Create custom trivia packs and drawing prompts for personalized game nights.', icon: '✏️' },
      { title: 'Leaderboards', description: 'Local session leaderboards with stats and achievements saved on-device.', icon: '🏆' },
    ],
    useCases: ['Family game nights', 'Travel entertainment', 'Office team building', 'Party and social events'],
    stats: [{ value: '20+', label: 'Party Games' }, { value: '8', label: 'Max Players' }, { value: '0', label: 'Internet Required' }],
    playStoreUrl: 'https://play.google.com/store',
  },
  myfinance: {
    slug: 'myfinance', name: 'MyFinance', tagline: 'Personal finance tracker', description: 'Comprehensive personal finance management.', longDescription: 'MyFinance puts you in complete control of your financial life. With automatic transaction categorization, AI-powered budget recommendations, investment portfolio tracking, and predictive cash flow analysis, MyFinance is the only financial app you\'ll ever need.', category: 'FinTech & E-Commerce', platforms: ['iOS', 'Android'], tags: ['Finance', 'Budgeting', 'React Native'], color: '#10B981', icon: '💰', status: 'Live',
    features: [
      { title: 'Auto Categorization', description: 'AI automatically categorizes 95%+ of transactions with machine learning that improves over time.', icon: '🤖' },
      { title: 'Budget Intelligence', description: 'Smart budget recommendations based on your spending patterns and financial goals.', icon: '📊' },
      { title: 'Investment Tracking', description: 'Portfolio performance tracking across stocks, ETFs, crypto, and retirement accounts.', icon: '📈' },
      { title: 'Bill Management', description: 'Never miss a bill with automatic due date detection and payment reminders.', icon: '📅' },
      { title: 'Net Worth Tracker', description: 'Real-time net worth calculation across all assets and liabilities.', icon: '💎' },
      { title: 'Financial Reports', description: 'Monthly and annual financial reports with spending trends and savings analysis.', icon: '📋' },
    ],
    useCases: ['Personal budget management', 'Expense tracking for freelancers', 'Family financial planning', 'Investment portfolio monitoring'],
    stats: [{ value: '95%+', label: 'Auto-Categorization' }, { value: 'Bank-Level', label: 'Security' }, { value: '10K+', label: 'Institutions' }],
    appStoreUrl: 'https://apps.apple.com',
    playStoreUrl: 'https://play.google.com/store',
  },
  apexmarketwatch: {
    slug: 'apexmarketwatch', name: 'ApexMarketWatch', tagline: 'Real-time markets & hedge fund filings', description: 'Professional market intelligence platform.', longDescription: 'ApexMarketWatch gives retail investors the same intelligence as institutional traders. Real-time stock data, SEC 13F hedge fund filing analysis, options flow, and insider transaction tracking — all in a beautifully designed mobile app that makes professional-grade market intelligence accessible to everyone.', category: 'FinTech & E-Commerce', platforms: ['iOS', 'Android', 'Web'], tags: ['Stocks', 'Finance', 'Investing'], color: '#F59E0B', icon: '📈', status: 'Live',
    features: [
      { title: 'Real-Time Market Data', description: 'Live stock quotes, options chains, and market depth with sub-second latency.', icon: '⚡' },
      { title: 'Hedge Fund Filings', description: 'Automated analysis of SEC 13F filings showing what top hedge funds are buying and selling.', icon: '🏦' },
      { title: 'Options Flow', description: 'Unusual options activity scanner to identify large institutional bets before they move markets.', icon: '🎯' },
      { title: 'Insider Tracking', description: 'Real-time insider transaction alerts when executives buy or sell their own company stock.', icon: '👁️' },
      { title: 'AI Market Analysis', description: 'AI-generated market summaries, earnings previews, and sector rotation analysis.', icon: '🧠' },
      { title: 'Portfolio Analytics', description: 'Advanced portfolio analytics with risk metrics, correlation analysis, and performance attribution.', icon: '📊' },
    ],
    useCases: ['Retail investor research', 'Portfolio management', 'Options trading', 'Market intelligence monitoring'],
    stats: [{ value: '<1s', label: 'Data Latency' }, { value: '10K+', label: 'Stocks Covered' }, { value: '13F', label: 'SEC Filings' }],
    appStoreUrl: 'https://apps.apple.com',
    playStoreUrl: 'https://play.google.com/store',
  },
  securecore: {
    slug: 'securecore', name: 'SecureCore', tagline: 'Enterprise security operations platform', description: 'SIEM, threat hunting, and incident response.', longDescription: 'SecureCore is the enterprise security operations platform built for the modern threat landscape. Combining SIEM, SOAR, threat hunting, and automated incident response in a single unified platform, SecureCore reduces mean time to detect (MTTD) by 80% and mean time to respond (MTTR) by 90%.', category: 'CyberSecurity & Infra', platforms: ['Web'], tags: ['Python', 'Security', 'SIEM'], color: '#EF4444', icon: '🛡️', status: 'Beta',
    features: [
      { title: 'AI-Powered SIEM', description: 'Machine learning-based anomaly detection that reduces false positives by 95%.', icon: '🧠' },
      { title: 'Threat Hunting', description: 'Proactive threat hunting with pre-built playbooks and custom query language.', icon: '🔍' },
      { title: 'Automated Response', description: 'SOAR capabilities with 200+ pre-built response playbooks for common attack scenarios.', icon: '⚡' },
      { title: 'Compliance Automation', description: 'Automated compliance reporting for SOC 2, ISO 27001, HIPAA, and PCI DSS.', icon: '📋' },
      { title: 'Threat Intelligence', description: 'Integration with 50+ threat intelligence feeds for real-time IOC matching.', icon: '🌐' },
      { title: 'Forensic Analysis', description: 'Deep packet inspection and forensic timeline reconstruction for incident investigation.', icon: '🔬' },
    ],
    useCases: ['Enterprise SOC operations', 'Compliance management', 'Incident response automation', 'Threat intelligence operations'],
    stats: [{ value: '80%', label: 'Faster Detection' }, { value: '95%', label: 'False Positive Reduction' }, { value: '200+', label: 'Response Playbooks' }],
  },
  offlinebuddy: {
    slug: 'offlinebuddy', name: 'OfflineBuddy', tagline: 'On-device LLM — works fully offline', description: 'Private AI assistant that runs entirely on your device.', longDescription: 'OfflineBuddy is the most capable offline AI assistant available on mobile. By running large language models entirely on-device using optimized quantization, OfflineBuddy delivers ChatGPT-quality responses with zero data leaving your device — ever. Perfect for privacy-conscious users, travelers, and anyone in low-connectivity environments.', category: 'Enterprise AI & DevTools', platforms: ['iOS', 'Android'], tags: ['Swift', 'LLM', 'Voice', 'Offline'], color: '#06B6D4', icon: '🤖', status: 'Beta',
    features: [
      { title: '100% On-Device', description: 'LLM runs entirely on your device. No data ever leaves your phone — guaranteed privacy.', icon: '🔒' },
      { title: 'Voice Interface', description: 'Natural voice conversations with on-device speech recognition and synthesis.', icon: '🎙️' },
      { title: 'Smart Keyboard', description: 'AI-powered smart reply keyboard that works in any app, even without internet.', icon: '⌨️' },
      { title: 'Offline Translator', description: 'Translate between 20+ languages without any internet connection.', icon: '🌍' },
      { title: 'Document Analysis', description: 'Analyze PDFs, notes, and documents locally with complete privacy.', icon: '📄' },
      { title: 'Custom Models', description: 'Import and run custom fine-tuned models optimized for your specific use case.', icon: '🧩' },
    ],
    useCases: ['Privacy-first AI assistance', 'Travel without connectivity', 'Sensitive document analysis', 'Offline language translation'],
    stats: [{ value: '0', label: 'Data Sent to Cloud' }, { value: '20+', label: 'Offline Languages' }, { value: '< 2s', label: 'Response Time' }],
    appStoreUrl: 'https://apps.apple.com',
    playStoreUrl: 'https://play.google.com/store',
  },
};

// Fallback for products not in the database.
// T-014 hard constraint: this function invents feature copy for products with
// no real detail page (49 of 58 listed products) — it MUST NOT set
// `dimensionLevel`. The returned object below has no such field, so it is
// `undefined` by the type's own contract; do not add one here.
export function generateFallbackProduct(slug: string): ProductData {
  const name = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return {
    slug, name, tagline: 'Enterprise-grade mobile application', description: 'A powerful application built by American Group LLC.', longDescription: `${name} is one of the many enterprise-grade applications in the American Group LLC portfolio. Built with cutting-edge technology and designed for real-world impact, this application delivers exceptional value to its users.`, category: 'Consumer Mobile', platforms: ['iOS', 'Android'], tags: ['Mobile', 'Enterprise'], color: '#6366F1', icon: '📱', status: 'Live',
    features: [
      { title: 'Enterprise Grade', description: 'Built to enterprise standards with security, scalability, and reliability at its core.', icon: '🏗️' },
      { title: 'Cross-Platform', description: 'Available on iOS and Android with a consistent, native experience on each platform.', icon: '📱' },
      { title: 'AI-Powered', description: 'Leverages the latest AI and machine learning to deliver intelligent, adaptive experiences.', icon: '🧠' },
      { title: 'Privacy First', description: 'Your data stays yours. End-to-end encryption and minimal data collection by design.', icon: '🔒' },
    ],
    useCases: ['Enterprise deployment', 'Consumer applications', 'Business productivity', 'Mobile-first workflows'],
  };
}

const platformIcons: Record<string, React.ReactNode> = {
  iOS: <Smartphone className="w-4 h-4" />,
  Android: <Smartphone className="w-4 h-4" />,
  Web: <Globe className="w-4 h-4" />,
  Windows: <Monitor className="w-4 h-4" />,
  macOS: <Monitor className="w-4 h-4" />,
  'Wear OS': <Watch className="w-4 h-4" />,
};

const statusColors: Record<string, string> = {
  Live: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Beta: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Coming Soon': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

/** T-014: renders only when a product carries a verified level — see contract.ts. Exported for direct component testing. */
export function DimensionBadge({ level }: { level: DimensionLevel }) {
  const meta = DIMENSION_LEVEL_META[level];
  return (
    <span
      data-testid="dimension-badge"
      className="inline-flex items-center text-xs px-3 py-1 rounded-full border font-medium whitespace-nowrap"
      style={{ background: 'rgba(99,102,241,0.16)', borderColor: 'rgba(129,140,248,0.6)', color: '#C7D2FE' }}
      title={meta.summary}
      aria-label={`Dimensional capability: ${meta.label}`}
    >
      {meta.short}
    </span>
  );
}

export default function ProductDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || '';
  const product = productDatabase[slug] || generateFallbackProduct(slug);

  return (
    <div className="min-h-screen bg-[#070B14] text-white">
      <Navigation />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 0%, ${product.color}20, transparent 70%)` }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${product.color}60, transparent)` }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link href="/products">
              <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Products
              </button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <span className={`text-xs px-3 py-1 rounded-full border font-medium ${statusColors[product.status]}`}>{product.status}</span>
                <span className="text-xs text-slate-500">{product.category}</span>
                {product.dimensionLevel && <DimensionBadge level={product.dimensionLevel} />}
              </div>
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-6" style={{ background: `${product.color}20`, border: `1px solid ${product.color}40` }}>
                {product.icon}
              </div>
              <h1 className="text-5xl font-bold mb-4 leading-tight" style={{ fontFamily: 'Sora, sans-serif' }}>{product.name}</h1>
              <p className="text-xl mb-6" style={{ color: product.color }}>{product.tagline}</p>
              <p className="text-slate-300 text-lg leading-relaxed mb-8">{product.longDescription}</p>

              <div className="flex flex-wrap gap-3 mb-8">
                {product.platforms.map(pl => (
                  <span key={pl} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm">
                    {platformIcons[pl]} {pl}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                {product.appStoreUrl && (
                  <a href={product.appStoreUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-all hover:scale-105 active:scale-95" style={{ backgroundColor: product.color }}>
                    <Download className="w-4 h-4" /> App Store
                  </a>
                )}
                {product.playStoreUrl && (
                  <a href={product.playStoreUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-xl border text-white font-semibold transition-all hover:bg-white/10" style={{ borderColor: `${product.color}50` }}>
                    <Download className="w-4 h-4" /> Google Play
                  </a>
                )}
                <Link href="/contact">
                  <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 font-semibold transition-all">
                    Request Demo <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
              {/* Stats cards */}
              {product.stats && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {product.stats.map((stat, i) => (
                    <div key={i} className="p-5 rounded-2xl border border-white/10 bg-white/5 text-center">
                      <div className="text-2xl font-bold mb-1" style={{ color: product.color, fontFamily: 'Sora, sans-serif' }}>{stat.value}</div>
                      <div className="text-slate-400 text-xs">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}
              {/* Tags */}
              <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
                <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Technology Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map(tag => (
                    <span key={tag} className="px-3 py-1.5 rounded-lg text-sm font-medium border" style={{ backgroundColor: `${product.color}15`, borderColor: `${product.color}30`, color: product.color }}>{tag}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>Key Features</h2>
            <p className="text-slate-400 text-lg">Everything you need, nothing you don't.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {product.features.map((feature, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="p-6 rounded-2xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15 transition-all group">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="font-bold text-white text-lg mb-2 group-hover:text-indigo-200 transition-colors">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-4xl font-bold mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>Built for Real-World Use</h2>
              <p className="text-slate-400 text-lg mb-8">Designed with real users in mind, {product.name} solves problems that matter.</p>
              <div className="space-y-4">
                {product.useCases.map((uc, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: product.color }} />
                    <span className="text-slate-300">{uc}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="grid grid-cols-2 gap-4">
              {[
                { icon: <Shield className="w-6 h-6" />, title: 'Enterprise Security', desc: 'Bank-level encryption and compliance' },
                { icon: <Zap className="w-6 h-6" />, title: 'High Performance', desc: 'Optimized for speed and reliability' },
                { icon: <Users className="w-6 h-6" />, title: 'Scalable', desc: 'Grows with your team and needs' },
                { icon: <TrendingUp className="w-6 h-6" />, title: 'Analytics', desc: 'Deep insights into usage and performance' },
              ].map((item, i) => (
                <div key={i} className="p-5 rounded-2xl border border-white/8 bg-white/[0.03]">
                  <div className="mb-3" style={{ color: product.color }}>{item.icon}</div>
                  <h4 className="font-semibold text-white text-sm mb-1">{item.title}</h4>
                  <p className="text-slate-500 text-xs">{item.desc}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6" style={{ background: `${product.color}20`, border: `1px solid ${product.color}40` }}>{product.icon}</div>
            <h2 className="text-4xl font-bold mb-4 text-white" style={{ fontFamily: 'Sora, sans-serif' }}>Ready to get started with {product.name}?</h2>
            <p className="text-slate-400 text-lg mb-8">Join thousands of users already benefiting from {product.name}. Get in touch for a personalized demo.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact">
                <button className="px-8 py-4 text-white font-semibold rounded-xl transition-all hover:scale-105 active:scale-95" style={{ backgroundColor: product.color }}>
                  Request a Demo
                </button>
              </Link>
              <Link href="/products">
                <button className="px-8 py-4 bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 font-semibold rounded-xl transition-all">
                  View All Products
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Related products */}
      <section className="py-16 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>More from American Group LLC</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.values(productDatabase).filter(p => p.slug !== slug).slice(0, 4).map(p => (
              <Link key={p.slug} href={`/products/${p.slug}`}>
                <div className="group p-4 rounded-xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15 transition-all cursor-pointer">
                  <div className="text-2xl mb-2">{p.icon}</div>
                  <h4 className="font-semibold text-white text-sm mb-1 group-hover:text-indigo-200 transition-colors">{p.name}</h4>
                  <p className="text-slate-500 text-xs line-clamp-2">{p.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
