import { useState } from "react";
import { ArrowRight, ShieldCheck, BookOpen, Target, Award, Users } from "lucide-react";
import { Button } from "../components/ui/Button.jsx";
import { Input, Field } from "../components/ui/Input.jsx";
import { BrandLogo } from "../components/BrandLogo.jsx";

const FEATURES = [
  { icon: BookOpen, label: "Trusted Content", color: "text-blue-400" },
  { icon: Target,   label: "Exam Focused",    color: "text-orange-400" },
  { icon: Award,    label: "Achieve Your Goal", color: "text-amber-400" },
  { icon: Users,    label: "Built for Aspirants", color: "text-orange-400" }
];

export function Login({ onSubmit, error, busy }) {
  const [email, setEmail] = useState("admin@loksewa.local");
  const [password, setPassword] = useState("LoksewaAdmin@123");

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ email, password });
  }

  return (
    <div className="min-h-screen flex bg-bg-0 text-slate-200 overflow-hidden">
      {/* Background orbs (splash style) */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="orb-orange anim-float" style={{ width: 600, height: 600, top: "-15%", right: "-10%", opacity: 0.45 }} />
        <div className="orb-blue" style={{ width: 500, height: 500, bottom: "-20%", left: "20%", opacity: 0.4 }} />
        <div className="orb-gold anim-float" style={{ width: 300, height: 300, top: "30%", left: "5%", opacity: 0.3, animationDelay: "2s" }} />
        <div className="orb-blue" style={{ width: 250, height: 250, top: "10%", right: "30%", opacity: 0.25 }} />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: "linear-gradient(rgba(249,115,22,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.025) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />
      </div>

      {/* Left: branding panel (splash-style) */}
      <div className="hidden lg:flex flex-col justify-between flex-1 p-12 relative max-w-xl">
        {/* Top: brand */}
        <BrandLogo size={48} textSize="text-base" />

        {/* Center: tagline */}
        <div className="max-w-md">
          <h1 className="text-3xl font-bold text-white leading-tight">
            Your AI-Powered{" "}
            <span className="text-gradient">Companion</span>{" "}
            for Loksewa Success
          </h1>
          <p className="text-sm text-slate-400 mt-4 leading-relaxed">
            Curate questions, publish mock tests, manage students, and triage content reports.
            Everything your mobile learning app needs, controlled by you.
          </p>

          {/* Feature pills — matches mobile app onboarding */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            {FEATURES.map(({ icon: Icon, label, color }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 glass-card"
              >
                <Icon className={`w-4 h-4 shrink-0 ${color}`} />
                <span className="text-xs font-semibold text-slate-300">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: security */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Secure admin-only access · JWT protected</span>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <BrandLogo size={42} textSize="text-sm" />
          </div>

          <div className="glass-card rounded-3xl p-8 shadow-pop anim-scale-in">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-white tracking-tight">Welcome back</h2>
              <p className="text-sm text-slate-400 mt-1.5">Sign in to your admin account</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Field label="Email address" required>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  placeholder="admin@loksewa.local"
                />
              </Field>

              <Field label="Password" required>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                />
              </Field>

              {error && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                loading={busy}
                className="w-full text-white font-bold anim-shine"
                style={{
                  background: "linear-gradient(135deg, #f97316 0%, #fbbf24 100%)",
                  boxShadow: "0 0 20px rgba(249,115,22,0.4), 0 4px 12px rgba(0,0,0,0.3)",
                  backgroundSize: "200% 100%"
                }}
                rightIcon={!busy && <ArrowRight className="w-4 h-4" />}
              >
                Sign in
              </Button>
            </form>

            <p className="text-xs text-slate-600 text-center mt-5">
              Default dev credentials pre-filled
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
