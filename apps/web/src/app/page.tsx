"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  SparklesIcon,
  BookOpenIcon,
  ChartBarIcon,
  TrophyIcon,
  ChatBubbleLeftRightIcon,
  BoltIcon,
} from "@hero-icons/react/24/outline";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500" />
            <span className="font-display font-bold text-xl">Loksewa AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost">Sign in</Link>
            <Link href="/register" className="btn-primary">Get started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-6">
            <SparklesIcon className="w-4 h-4" />
            AI Learning OS for Nepal
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight mb-6">
            Master Loksewa with <br />
            <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
              your personal AI tutor
            </span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
            Adaptive learning, daily missions, verified answers, and an AI tutor that
            remembers your strengths and weaknesses — all in Nepali and English.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/register" className="btn-primary text-base px-7 py-3">
              Start free
            </Link>
            <Link href="/scan" className="btn-ghost text-base px-7 py-3">
              Try Quick Scan
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<ChatBubbleLeftRightIcon className="w-6 h-6" />}
            title="AI Tutor (लोकसेवा सहायक)"
            desc="Ask anything in Nepali or English. Get grounded answers with verified sources."
          />
          <FeatureCard
            icon={<BoltIcon className="w-6 h-6" />}
            title="Daily Missions"
            desc="Personalized practice every day. We pick the questions you need most."
          />
          <FeatureCard
            icon={<BookOpenIcon className="w-6 h-6" />}
            title="Verified Content"
            desc="Every answer cites its source. No hallucinations, no surprises."
          />
          <FeatureCard
            icon={<ChartBarIcon className="w-6 h-6" />}
            title="Adaptive Engine"
            desc="The system gets harder when you're ready, easier when you struggle."
          />
          <FeatureCard
            icon={<TrophyIcon className="w-6 h-6" />}
            title="Streaks & XP"
            desc="Duolingo-style gamification that keeps you coming back."
          />
          <FeatureCard
            icon={<SparklesIcon className="w-6 h-6" />}
            title="Memory Engine"
            desc="We remember what you know and what you forget. Forever."
          />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="card hover:shadow-md transition">
      <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-display font-semibold mb-2">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
