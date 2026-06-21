/**
 * Products Page — AGL Enterprise Product Catalog
 * Design: Dark enterprise with glowing cards, category filters, search
 * All products organized by vertical with individual product links
 */
import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ArrowRight, Smartphone, Globe, Monitor, Watch, Star, Zap, Shield, TrendingUp, Cpu } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

type ProductCategory =
  | 'Enterprise AI & DevTools'
  | 'Consumer Mobile'
  | 'FinTech & E-Commerce'
  | 'CyberSecurity & Infra'
  | 'Travel & Aviation'
  | 'Health & Wellness'
  | 'E-Commerce & Deals'
  | 'Social & Lifestyle';

interface Product {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: ProductCategory;
  platforms: string[];
  tags: string[];
  color: string;
  icon: string;
  status: 'Live' | 'Beta' | 'Coming Soon';
  highlight?: boolean;
}

const products: Product[] = [
  // Enterprise AI & DevTools
  { slug: 'cognicore', name: 'CogniCore AI Platform', tagline: 'Umbrella cognitive AI services platform', description: 'Consolidates cognitive AI services including reasoning, tool-augmented agents, and multi-modal intelligence pipelines for enterprise deployments.', category: 'Enterprise AI & DevTools', platforms: ['Web'], tags: ['Python', 'LLM', 'RAG', 'Agents'], color: '#6366F1', icon: '🧠', status: 'Beta', highlight: true },
  { slug: 'verba', name: 'Verba', tagline: 'Multilingual conversational AI', description: 'Multilingual conversational AI with real-time translation, context-aware responses, and cross-platform Flutter delivery.', category: 'Enterprise AI & DevTools', platforms: ['iOS', 'Android', 'Web'], tags: ['Flutter', 'NLP', 'Chat', 'AI'], color: '#8B5CF6', icon: '💬', status: 'Beta', highlight: true },
  { slug: 'offlinebuddy', name: 'OfflineBuddy', tagline: 'On-device LLM — works fully offline', description: 'On-device LLM assistant with chat, voice, translator, and smart-reply keyboard. Works fully offline after one-time model download.', category: 'Enterprise AI & DevTools', platforms: ['iOS', 'Android'], tags: ['Swift', 'LLM', 'Voice', 'Offline'], color: '#06B6D4', icon: '🤖', status: 'Beta', highlight: true },
  { slug: 'localbuddy', name: 'Local Buddy', tagline: 'Private on-device AI chat', description: 'On-device offline AI chat app running LLMs entirely on-device with no internet required. Private, fast, and always available.', category: 'Enterprise AI & DevTools', platforms: ['iOS', 'Android'], tags: ['Swift', 'On-Device AI', 'Privacy'], color: '#10B981', icon: '🔒', status: 'Live' },
  { slug: 'agrammarly', name: 'AGrammarly', tagline: 'AI writing assistant', description: 'AI-powered writing assistant providing real-time suggestions, style improvements, and tone adjustments for professional writing.', category: 'Enterprise AI & DevTools', platforms: ['iOS', 'Android', 'Web'], tags: ['TypeScript', 'NLP', 'Writing AI'], color: '#EC4899', icon: '✍️', status: 'Beta' },
  { slug: 'agstudio', name: 'AGStudio', tagline: 'AI-powered creative studio', description: 'AI-powered creative studio for design, prototyping, and content generation combining generative AI with professional design tools.', category: 'Enterprise AI & DevTools', platforms: ['iOS', 'Android', 'Web'], tags: ['TypeScript', 'Generative AI', 'Design'], color: '#F59E0B', icon: '🎨', status: 'Beta' },
  { slug: 'carerupgradeai', name: 'CareerUpgrade AI', tagline: 'AI-powered career development', description: 'AI-powered career development platform providing personalized learning paths, resume optimization, and interview coaching.', category: 'Enterprise AI & DevTools', platforms: ['iOS', 'Android', 'Web'], tags: ['TypeScript', 'AI', 'EdTech'], color: '#14B8A6', icon: '🚀', status: 'Beta' },
  { slug: 'lifeadminai', name: 'LifeAdmin AI', tagline: 'AI personal life administrator', description: 'AI-powered personal life administration assistant automating scheduling, bill management, and life logistics.', category: 'Enterprise AI & DevTools', platforms: ['iOS', 'Android'], tags: ['TypeScript', 'AI', 'Automation'], color: '#EF4444', icon: '📋', status: 'Coming Soon' },
  { slug: 'docstream', name: 'DocStream Enterprise', tagline: 'Enterprise document streaming pipeline', description: 'Enterprise document streaming pipeline with AI-powered extraction, classification, and routing for high-volume document streams.', category: 'Enterprise AI & DevTools', platforms: ['Web'], tags: ['Python', 'FastAPI', 'NLP'], color: '#3B82F6', icon: '📄', status: 'Beta' },
  { slug: 'datacore', name: 'DataCore Enterprise', tagline: 'Enterprise data platform', description: 'Enterprise-grade data platform centralizing ingestion, transformation, storage, and analytics across the AGL portfolio.', category: 'Enterprise AI & DevTools', platforms: ['Web'], tags: ['Python', 'Data', 'Analytics'], color: '#6366F1', icon: '🗄️', status: 'Beta' },
  { slug: 'infraforge', name: 'InfraForge Enterprise', tagline: 'Infrastructure automation & orchestration', description: 'Enterprise infrastructure automation and orchestration platform managing provisioning, scaling, and lifecycle of cloud and on-premise resources.', category: 'Enterprise AI & DevTools', platforms: ['Web'], tags: ['Python', 'IaC', 'Cloud'], color: '#8B5CF6', icon: '🏗️', status: 'Beta' },
  { slug: 'audiosuite', name: 'AudioSphere Suite', tagline: 'Audio AI platform', description: 'Umbrella suite for audio intelligence covering speech recognition, synthesis, music generation, and spatial audio processing.', category: 'Enterprise AI & DevTools', platforms: ['Web', 'iOS', 'Android'], tags: ['Python', 'Audio AI', 'TTS'], color: '#EC4899', icon: '🎵', status: 'Beta' },

  // Consumer Mobile
  { slug: 'myhealth', name: 'MyHealth', tagline: 'Personal fitness OS for Android & Wear OS', description: 'Personal fitness OS for Android & Wear OS covering training, cardio, nutrition, sleep, mindfulness, and AI coaching.', category: 'Health & Wellness', platforms: ['Android', 'Wear OS', 'iOS'], tags: ['Android', 'Wear OS', 'HealthKit', 'AI'], color: '#EF4444', icon: '❤️', status: 'Live', highlight: true },
  { slug: 'virtuband', name: 'VirtuBand', tagline: 'Smart wearable companion app', description: 'Smart wearable companion app with advanced health analytics, real-time biometric tracking, and personalized insights.', category: 'Health & Wellness', platforms: ['iOS', 'Android'], tags: ['TypeScript', 'Wearable', 'BLE'], color: '#F59E0B', icon: '⌚', status: 'Live' },
  { slug: 'buddyplay', name: 'BuddyPlay', tagline: 'Offline multiplayer party games', description: 'Native Android offline multiplayer party games. P2P over Wi-Fi, Hotspot, and BLE — works in subway tunnels.', category: 'Social & Lifestyle', platforms: ['Android'], tags: ['Android', 'P2P', 'BLE', 'Gaming'], color: '#8B5CF6', icon: '🎮', status: 'Live', highlight: true },
  { slug: 'agcleaner', name: 'AGCleaner', tagline: 'Cross-platform system optimizer', description: 'Cross-platform memory cleaner, storage optimizer, and system performance booster for Android and iOS.', category: 'Consumer Mobile', platforms: ['iOS', 'Android', 'Windows', 'macOS'], tags: ['TypeScript', 'Android', 'iOS'], color: '#3B82F6', icon: '🧹', status: 'Live' },
  { slug: 'agrecorder', name: 'AGRecorder', tagline: 'Professional screen recorder', description: 'High-framerate screen recorder with dual-channel audio capture for macOS, Windows, iOS, and Android.', category: 'Consumer Mobile', platforms: ['iOS', 'Android', 'Windows', 'macOS'], tags: ['Cross-platform', 'Screen Recorder'], color: '#EF4444', icon: '🎥', status: 'Live' },
  { slug: 'mycard', name: 'MyCard', tagline: 'Thought capture for Android & Wear OS', description: 'Native Android + Wear OS thought-capture app. Every entry is a Card — tap once to convert to Note, Task, or Reminder.', category: 'Consumer Mobile', platforms: ['Android', 'Wear OS'], tags: ['Android', 'Wear OS', 'Productivity'], color: '#10B981', icon: '🃏', status: 'Live' },
  { slug: 'imeasure', name: 'iMeasure', tagline: 'Pocket utility suite', description: 'All-in-one utility app with Clock, Calculator, Measure, Compass, and Level for Android phones and Wear OS.', category: 'Consumer Mobile', platforms: ['Android', 'Wear OS'], tags: ['Android', 'Wear OS', 'Utilities'], color: '#F59E0B', icon: '📐', status: 'Live' },
  { slug: 'imaps', name: 'iMaps', tagline: 'Offline maps & navigation', description: 'Comprehensive offline maps with turn-by-turn navigation, points of interest, and real-time traffic.', category: 'Consumer Mobile', platforms: ['iOS', 'Android'], tags: ['Maps', 'Navigation', 'Offline'], color: '#10B981', icon: '🗺️', status: 'Live' },
  { slug: 'wifitrail', name: 'WiFiTrail', tagline: 'Wi-Fi security auditor', description: 'Network security auditor and credential testing utility for Android and PC. Identify vulnerabilities in your Wi-Fi network.', category: 'Consumer Mobile', platforms: ['Android', 'Windows'], tags: ['Security', 'Wi-Fi', 'Network'], color: '#6366F1', icon: '🔐', status: 'Beta' },
  { slug: 'snapedit', name: 'SnapEdit Pro', tagline: 'AI-powered photo editor', description: 'AI-powered photo editing app with smart filters, background removal, and one-tap enhancements.', category: 'Consumer Mobile', platforms: ['iOS', 'Android'], tags: ['Swift', 'AI', 'Photos'], color: '#EC4899', icon: '📸', status: 'Live' },
  { slug: 'goalstack', name: 'GoalStack', tagline: 'Science-backed habit tracker', description: 'Science-backed habit tracking and goal achievement app with AI coaching and streak analytics.', category: 'Consumer Mobile', platforms: ['iOS', 'Android'], tags: ['Swift', 'AI', 'Productivity'], color: '#14B8A6', icon: '🎯', status: 'Live' },

  // FinTech & E-Commerce
  { slug: 'myfinance', name: 'MyFinance', tagline: 'Personal finance tracker', description: 'Comprehensive finance tracking with budgets, expense categorization, investment monitoring, and AI-powered insights.', category: 'FinTech & E-Commerce', platforms: ['iOS', 'Android'], tags: ['Finance', 'Budgeting', 'React Native'], color: '#10B981', icon: '💰', status: 'Live', highlight: true },
  { slug: 'apexmarketwatch', name: 'ApexMarketWatch', tagline: 'Real-time markets & hedge fund filings', description: 'Aggregates real-time stock data, SEC 13F hedge fund filings, and retail investment deals in one powerful platform.', category: 'FinTech & E-Commerce', platforms: ['iOS', 'Android', 'Web'], tags: ['Stocks', 'Finance', 'Investing'], color: '#F59E0B', icon: '📈', status: 'Live', highlight: true },
  { slug: 'nexustransferpay', name: 'NexusTransferPay', tagline: 'Cross-border payments made instant', description: 'Fast, low-fee international money transfers with multi-currency wallets and real-time exchange rates.', category: 'FinTech & E-Commerce', platforms: ['iOS', 'Android'], tags: ['Payments', 'Fintech', 'International'], color: '#3B82F6', icon: '💳', status: 'Beta' },
  { slug: 'milemaster', name: 'MileMaster', tagline: 'IRS-compliant mileage tracking', description: 'Automatic GPS-based mileage tracker that generates IRS-compliant tax deduction reports for freelancers and gig workers.', category: 'FinTech & E-Commerce', platforms: ['iOS', 'Android'], tags: ['Mileage', 'Tax', 'GPS'], color: '#14B8A6', icon: '🚗', status: 'Live' },
  { slug: 'codedeal', name: 'CodeDeal', tagline: 'Offer codes & referral rewards hub', description: 'Centralized platform for discovering, sharing, and tracking offer codes and referral rewards across thousands of apps.', category: 'FinTech & E-Commerce', platforms: ['iOS', 'Android'], tags: ['Deals', 'Coupons', 'Referrals'], color: '#EF4444', icon: '🏷️', status: 'Live' },
  { slug: 'dealzap', name: 'DealZap', tagline: 'Lightning-fast deal discovery', description: 'Real-time deal aggregator scanning thousands of retailers for the best prices on products you love.', category: 'FinTech & E-Commerce', platforms: ['iOS', 'Android'], tags: ['Deals', 'Shopping', 'Price Tracking'], color: '#F59E0B', icon: '⚡', status: 'Live' },
  { slug: 'smartbasket', name: 'SmartBasket', tagline: 'AI grocery shopping optimizer', description: 'Smart grocery app that compares prices across stores, builds optimized shopping lists, and tracks pantry inventory.', category: 'FinTech & E-Commerce', platforms: ['iOS', 'Android'], tags: ['Grocery', 'AI', 'Shopping'], color: '#10B981', icon: '🛒', status: 'Live' },
  { slug: 'fashionradar', name: 'FashionRadar', tagline: 'AI fashion discovery & style advisor', description: 'Personalized fashion discovery app with AI style recommendations, outfit planning, and deal alerts from top brands.', category: 'FinTech & E-Commerce', platforms: ['iOS', 'Android'], tags: ['Fashion', 'AI', 'Shopping'], color: '#EC4899', icon: '👗', status: 'Live' },
  { slug: 'solefind', name: 'SoleFind', tagline: 'Sneaker & footwear deal tracker', description: 'Dedicated sneaker and footwear deal finder with release calendars, resale price tracking, and instant buy alerts.', category: 'FinTech & E-Commerce', platforms: ['iOS', 'Android'], tags: ['Sneakers', 'Fashion', 'Deals'], color: '#F59E0B', icon: '👟', status: 'Live' },
  { slug: 'bagzap', name: 'BagZap', tagline: 'Luxury bag & accessories deals', description: 'Premium handbag and accessories deal aggregator with authentication verification and resale market tracking.', category: 'FinTech & E-Commerce', platforms: ['iOS', 'Android'], tags: ['Luxury', 'Fashion', 'Deals'], color: '#8B5CF6', icon: '👜', status: 'Live' },
  { slug: 'ridezap', name: 'RideZap', tagline: 'Ride-share & rental deal aggregator', description: 'Compare prices across Uber, Lyft, and rental services in real-time to always get the best ride deal.', category: 'FinTech & E-Commerce', platforms: ['iOS', 'Android'], tags: ['Rides', 'Transportation', 'Deals'], color: '#3B82F6', icon: '🚕', status: 'Live' },
  { slug: 'foodradar', name: 'FoodRadar', tagline: 'Restaurant deals & food delivery finder', description: 'Aggregates restaurant deals, food delivery discounts, and local dining offers in real-time.', category: 'FinTech & E-Commerce', platforms: ['iOS', 'Android'], tags: ['Food', 'Delivery', 'Deals'], color: '#EF4444', icon: '🍕', status: 'Live' },
  { slug: 'cardeal', name: 'CarDeal', tagline: 'New & used car deal aggregator', description: 'Comprehensive car buying platform with price comparison, dealer reviews, financing options, and market value analysis.', category: 'FinTech & E-Commerce', platforms: ['iOS', 'Android'], tags: ['Cars', 'Automotive', 'Deals'], color: '#6366F1', icon: '🚗', status: 'Live' },
  { slug: 'nearserve', name: 'NearServe', tagline: 'Hyperlocal service marketplace', description: 'On-demand local services marketplace connecting consumers with nearby service providers.', category: 'FinTech & E-Commerce', platforms: ['iOS', 'Android'], tags: ['Services', 'Local', 'Marketplace'], color: '#14B8A6', icon: '🔧', status: 'Live' },

  // CyberSecurity & Infra
  { slug: 'securecore', name: 'SecureCore', tagline: 'Enterprise security operations platform', description: 'Enterprise security operations platform with SIEM, threat hunting, and automated incident response.', category: 'CyberSecurity & Infra', platforms: ['Web'], tags: ['Python', 'Security', 'SIEM'], color: '#EF4444', icon: '🛡️', status: 'Beta', highlight: true },
  { slug: 'threatwatch', name: 'ThreatWatch', tagline: 'Real-time threat intelligence', description: 'Real-time threat intelligence platform aggregating global threat feeds with AI-powered analysis.', category: 'CyberSecurity & Infra', platforms: ['Web'], tags: ['Python', 'AI', 'Threat Intel'], color: '#F59E0B', icon: '👁️', status: 'Beta' },
  { slug: 'zerotrust', name: 'ZeroTrust Gateway', tagline: 'Enterprise zero-trust network access', description: 'Enterprise zero-trust network access solution with identity-aware proxying and continuous verification.', category: 'CyberSecurity & Infra', platforms: ['Web'], tags: ['Go', 'Zero Trust', 'IAM'], color: '#3B82F6', icon: '🔒', status: 'Beta' },
  { slug: 'cloudarmor', name: 'CloudArmor', tagline: 'Multi-cloud security posture management', description: 'Multi-cloud security posture management with compliance automation and misconfiguration detection.', category: 'CyberSecurity & Infra', platforms: ['Web'], tags: ['Python', 'Cloud', 'Compliance'], color: '#6366F1', icon: '☁️', status: 'Beta' },
  { slug: 'vaultos', name: 'VaultOS', tagline: 'Enterprise secrets management', description: 'Enterprise secrets management and PKI platform with hardware security module integration.', category: 'CyberSecurity & Infra', platforms: ['Web'], tags: ['Go', 'Security', 'PKI'], color: '#8B5CF6', icon: '🗝️', status: 'Beta' },

  // Travel & Aviation
  { slug: 'aeroswift', name: 'AeroSwift', tagline: 'Real-time flight tracking & aviation data', description: 'Comprehensive real-time flight tracking with live aircraft positions, delays, gate info, and aviation weather.', category: 'Travel & Aviation', platforms: ['iOS', 'Android'], tags: ['Aviation', 'Travel', 'Real-time'], color: '#3B82F6', icon: '✈️', status: 'Live', highlight: true },
  { slug: 'aeroswift-personal', name: 'AeroSwift Personal', tagline: 'Digital logbook for private pilots', description: 'Professional aviation logbook and flight planning app for private pilots, student pilots, and aviation enthusiasts.', category: 'Travel & Aviation', platforms: ['iOS', 'Android'], tags: ['Aviation', 'Pilots', 'Logbook'], color: '#6366F1', icon: '🛩️', status: 'Live' },
  { slug: 'aeroswift-transit', name: 'AeroSwift Transit', tagline: 'Airport connections & transit management', description: 'Smart airport transit app with connection management, terminal navigation, lounge access, and ground transport booking.', category: 'Travel & Aviation', platforms: ['iOS', 'Android'], tags: ['Airport', 'Transit', 'Travel'], color: '#0EA5E9', icon: '🛫', status: 'Beta' },
  { slug: 'travelhub', name: 'TravelHub', tagline: 'All-in-one travel planning & booking', description: 'Comprehensive travel platform combining itinerary planning, booking management, local discovery, and travel documentation.', category: 'Travel & Aviation', platforms: ['iOS', 'Android'], tags: ['Travel', 'Itinerary', 'AI'], color: '#F59E0B', icon: '🌍', status: 'Beta' },
  { slug: 'travelzap', name: 'TravelZap', tagline: 'Flash travel deals at lightning speed', description: 'Real-time travel deal aggregator with instant booking for flights, hotels, and packages at exclusive prices.', category: 'Travel & Aviation', platforms: ['iOS', 'Android'], tags: ['Travel', 'Deals', 'Flights'], color: '#EF4444', icon: '⚡', status: 'Live' },
  { slug: 'staydeal', name: 'StayDeal', tagline: 'Hotel deals & accommodation finder', description: 'Smart hotel deal finder with AI-powered recommendations, price predictions, and exclusive member rates.', category: 'Travel & Aviation', platforms: ['iOS', 'Android'], tags: ['Hotels', 'Accommodation', 'AI'], color: '#8B5CF6', icon: '🏨', status: 'Live' },
  { slug: 'skydeal', name: 'SkyDeal', tagline: 'Flight deals & airfare intelligence', description: 'Advanced airfare deal finder with fare prediction, error fare detection, and flexible date search.', category: 'Travel & Aviation', platforms: ['iOS', 'Android'], tags: ['Flights', 'Airfare', 'AI'], color: '#06B6D4', icon: '🎫', status: 'Live' },
  { slug: 'driftdate', name: 'DriftDate', tagline: 'Layered location-based dating', description: 'Innovative dating platform with Server/State/County/ZIP discovery layers on Android + Wear OS.', category: 'Social & Lifestyle', platforms: ['Android', 'Wear OS'], tags: ['Dating', 'Social', 'Location'], color: '#EC4899', icon: '💕', status: 'Beta' },

  // Social & Lifestyle
  { slug: 'homewise', name: 'HomeWise', tagline: 'Real estate for the middle class', description: 'Middle-class focused house listing, sales, and rental mobile app using public real estate APIs with AI price predictions.', category: 'Social & Lifestyle', platforms: ['iOS', 'Android'], tags: ['Real Estate', 'Housing', 'AI'], color: '#10B981', icon: '🏠', status: 'Live' },
  { slug: 'roomcraft', name: 'RoomCraft', tagline: 'AI interior design for your space', description: 'Interior design suggestions by square footage and OCR-processed room photos with AI redesign and GPS local sourcing.', category: 'Social & Lifestyle', platforms: ['iOS', 'Android'], tags: ['Interior Design', 'AI', 'AR'], color: '#8B5CF6', icon: '🛋️', status: 'Beta' },
  { slug: 'chefcount', name: 'ChefCount', tagline: 'Smart cooking app that scales for any crowd', description: 'Smart cooking app that scales recipes by people count with kitchen utility affiliate listings and in-app monetization.', category: 'Social & Lifestyle', platforms: ['iOS', 'Android'], tags: ['Cooking', 'Recipes', 'Food'], color: '#F59E0B', icon: '👨‍🍳', status: 'Live' },
  { slug: 'golfvision', name: 'GolfVision Elite', tagline: 'AI golf swing & ball flight analytics', description: 'Professional golf swing analysis and ball flight analytics powered by computer vision and AI.', category: 'Social & Lifestyle', platforms: ['iOS', 'Android'], tags: ['Golf', 'Sports', 'AI'], color: '#10B981', icon: '⛳', status: 'Beta' },
  { slug: 'newsboard', name: 'NewsBoard', tagline: 'Personalized news aggregator', description: 'AI-curated news aggregator that learns your interests and delivers a personalized daily briefing.', category: 'Social & Lifestyle', platforms: ['iOS', 'Android'], tags: ['News', 'AI', 'Media'], color: '#3B82F6', icon: '📰', status: 'Live' },
  { slug: 'eventspark', name: 'EventSpark', tagline: 'Discover local events & experiences', description: 'Location-aware event discovery platform for concerts, sports, festivals, and local experiences.', category: 'Social & Lifestyle', platforms: ['iOS', 'Android'], tags: ['Events', 'Local', 'Entertainment'], color: '#8B5CF6', icon: '🎪', status: 'Live' },
  { slug: 'eventglow', name: 'EventGlow', tagline: 'Outdoor events & vacation deals', description: 'Location-aware entertainment and outdoor events affiliate promotion app with cheap local deals.', category: 'Social & Lifestyle', platforms: ['iOS', 'Android'], tags: ['Events', 'Outdoors', 'Deals'], color: '#10B981', icon: '🌟', status: 'Live' },
  { slug: 'agvending', name: 'AGVending', tagline: 'AI-powered vending machine platform', description: 'C++20 multi-archetype vending machine platform with AI forecasting, anomaly detection, and Flutter mobile control app.', category: 'Enterprise AI & DevTools', platforms: ['iOS', 'Android', 'Web'], tags: ['IoT', 'AI', 'Enterprise'], color: '#6366F1', icon: '🏪', status: 'Beta' },
];

const allCategories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

const categoryColors: Record<string, string> = {
  'Enterprise AI & DevTools': '#6366F1',
  'Consumer Mobile': '#3B82F6',
  'FinTech & E-Commerce': '#10B981',
  'CyberSecurity & Infra': '#EF4444',
  'Travel & Aviation': '#0EA5E9',
  'Health & Wellness': '#F59E0B',
  'Social & Lifestyle': '#EC4899',
};

const statusColors: Record<string, string> = {
  Live: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Beta: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Coming Soon': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const platformIcons: Record<string, React.ReactNode> = {
  iOS: <Smartphone className="w-3 h-3" />,
  Android: <Smartphone className="w-3 h-3" />,
  Web: <Globe className="w-3 h-3" />,
  Windows: <Monitor className="w-3 h-3" />,
  macOS: <Monitor className="w-3 h-3" />,
  'Wear OS': <Watch className="w-3 h-3" />,
  watchOS: <Watch className="w-3 h-3" />,
};

export default function Products() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activePlatform, setActivePlatform] = useState('All');

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.tagline.toLowerCase().includes(search.toLowerCase()) || p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchCat = activeCategory === 'All' || p.category === activeCategory;
      const matchPlatform = activePlatform === 'All' || p.platforms.includes(activePlatform);
      return matchSearch && matchCat && matchPlatform;
    });
  }, [search, activeCategory, activePlatform]);

  const highlights = products.filter(p => p.highlight);

  return (
    <div className="min-h-screen bg-[#070B14] text-white">
      <Navigation />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/30 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              {products.length}+ Products Across 7 Verticals
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight" style={{ fontFamily: 'Sora, sans-serif' }}>
              Our Product
              <span className="block bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">Portfolio</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Enterprise-grade mobile apps and platforms built for scale. From AI assistants to fintech solutions — every product crafted for real-world impact.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: <Cpu className="w-5 h-5 text-indigo-400" />, value: `${products.length}+`, label: 'Total Products' },
              { icon: <Smartphone className="w-5 h-5 text-emerald-400" />, value: `${products.filter(p => p.platforms.includes('iOS') || p.platforms.includes('Android')).length}+`, label: 'Mobile Apps' },
              { icon: <Shield className="w-5 h-5 text-amber-400" />, value: '7', label: 'Verticals' },
              { icon: <TrendingUp className="w-5 h-5 text-violet-400" />, value: `${products.filter(p => p.status === 'Live').length}`, label: 'Live Products' },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="flex justify-center mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>{stat.value}</div>
                <div className="text-slate-500 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-8">
            <Star className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Featured Products</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {highlights.map((p, i) => (
              <motion.div key={p.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Link href={`/products/${p.slug}`}>
                  <div className="group relative p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 transition-all duration-300 cursor-pointer overflow-hidden h-full">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" style={{ background: `radial-gradient(circle at 50% 0%, ${p.color}15, transparent 70%)` }} />
                    <div className="relative z-10">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3" style={{ background: `${p.color}20`, border: `1px solid ${p.color}30` }}>{p.icon}</div>
                      <h3 className="font-semibold text-white text-sm mb-1">{p.name}</h3>
                      <p className="text-slate-400 text-xs leading-relaxed mb-3">{p.tagline}</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[p.status]}`}>{p.status}</span>
                        <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-30 py-4 bg-[#070B14]/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="text" placeholder="Search products, tags..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50 transition-all" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-slate-500" />
              {['All', 'iOS', 'Android', 'Web', 'Windows'].map(pl => (
                <button key={pl} onClick={() => setActivePlatform(pl)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activePlatform === pl ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}>{pl}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {allCategories.map(cat => {
              const count = cat === 'All' ? products.length : products.filter(p => p.category === cat).length;
              const color = cat === 'All' ? undefined : categoryColors[cat];
              return (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${activeCategory === cat ? 'text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`} style={activeCategory === cat ? { backgroundColor: color ? color : '#6366F1', color: '#fff' } : {}}>
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-slate-400 text-sm">Showing <span className="text-white font-medium">{filtered.length}</span> products{activeCategory !== 'All' && <span> in <span className="text-indigo-400">{activeCategory}</span></span>}</p>
          </div>
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 text-slate-500">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-lg">No products match your search</p>
                <button onClick={() => { setSearch(''); setActiveCategory('All'); setActivePlatform('All'); }} className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm underline">Clear filters</button>
              </motion.div>
            ) : (
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((p, i) => (
                  <motion.div key={p.slug} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.02 }}>
                    <Link href={`/products/${p.slug}`}>
                      <div className="group h-full p-6 rounded-2xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 cursor-pointer relative overflow-hidden">
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 30% 30%, ${p.color}10, transparent 60%)` }} />
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: `${p.color}15`, border: `1px solid ${p.color}25` }}>{p.icon}</div>
                            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColors[p.status]}`}>{p.status}</span>
                          </div>
                          <h3 className="font-bold text-white text-lg mb-1 group-hover:text-indigo-200 transition-colors">{p.name}</h3>
                          <p className="text-sm font-medium mb-3" style={{ color: p.color }}>{p.tagline}</p>
                          <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2">{p.description}</p>
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {p.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/8">{tag}</span>
                            ))}
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t border-white/8">
                            <div className="flex items-center gap-2 flex-wrap">
                              {p.platforms.slice(0, 3).map(pl => (
                                <span key={pl} className="flex items-center gap-1 text-slate-500 text-xs">{platformIcons[pl]}<span>{pl}</span></span>
                              ))}
                            </div>
                            <span className="text-xs font-medium flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: p.color }}>
                              Details <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4 text-white" style={{ fontFamily: 'Sora, sans-serif' }}>Don't see what you need?</h2>
          <p className="text-slate-400 text-lg mb-8">We build custom enterprise software and mobile apps. Tell us your idea and we'll make it a reality.</p>
          <Link href="/contact">
            <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95">
              Start a Custom Project →
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
