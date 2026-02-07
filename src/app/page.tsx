"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  Users,
  Globe,
  Sparkles,
  Shield,
  MessageCircle,
  Languages,
  ArrowRight,
} from "lucide-react";

const featureIcons = {
  collab: Users,
  publish: Globe,
  simple: Sparkles,
  privacy: Shield,
  comments: MessageCircle,
  multilang: Languages,
};

const featureKeys = [
  "collab",
  "publish",
  "simple",
  "privacy",
  "comments",
  "multilang",
] as const;

export default function LandingPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="blob-1" />
      <div className="blob-2" />
      <div className="blob-3" />

      <Navbar />

      {/* Hero */}
      <main className="flex-1 relative z-10">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center max-w-3xl mx-auto animate-in">
            <div className="inline-flex items-center gap-2 badge-brand mb-6 text-sm">
              <Sparkles className="w-4 h-4" />
              Open Source · Kostenlos · DSGVO-konform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
              <span className="text-gradient">{t("landing.hero.title")}</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t("landing.hero.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register" className="btn-primary btn-lg group">
                {t("landing.hero.cta")}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/guide" className="btn-secondary btn-lg">
                {t("landing.hero.ctaSecondary")}
              </Link>
            </div>
          </div>

          {/* Preview mockup */}
          <div className="mt-20 max-w-4xl mx-auto">
            <div className="glass-strong rounded-3xl p-2 shadow-2xl">
              <div className="bg-gradient-to-br from-white/80 to-white/40 rounded-2xl p-8">
                {/* Fake browser chrome */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <div className="flex-1 ml-4 h-7 bg-gray-100 rounded-lg flex items-center px-3">
                    <span className="text-xs text-gray-400">
                      blogdidacta.de/blog/mein-erster-eintrag
                    </span>
                  </div>
                </div>

                {/* Fake blog content */}
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200/60 rounded-lg w-3/4" />
                  <div className="flex items-center gap-3">
                    <div className="h-5 bg-brand-100 rounded w-20" />
                    <div className="h-5 bg-gray-100 rounded w-32" />
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="h-4 bg-gray-100 rounded w-full" />
                    <div className="h-4 bg-gray-100 rounded w-full" />
                    <div className="h-4 bg-gray-100 rounded w-5/6" />
                  </div>
                  <div className="h-40 bg-gradient-to-br from-brand-50 to-purple-50 rounded-2xl mt-4 flex items-center justify-center">
                    <span className="text-brand-300 text-sm">📸 Bild</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-full" />
                    <div className="h-4 bg-gray-100 rounded w-4/5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
            {t("landing.features.title")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureKeys.map((key, i) => {
              const Icon = featureIcons[key];
              return (
                <div
                  key={key}
                  className="glass rounded-2xl p-6 hover:bg-white/70 transition-all duration-300 group"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center mb-4 shadow-lg shadow-brand-500/20 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    {t(`landing.features.${key}.title`)}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {t(`landing.features.${key}.desc`)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="glass-dark rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-600/20 to-purple-600/20" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-4">
                Bereit loszulegen?
              </h2>
              <p className="text-white/70 mb-8 max-w-xl mx-auto">
                Erstellen Sie in wenigen Minuten Ihren ersten kollaborativen
                Blogeintrag mit Ihrer Klasse.
              </p>
              <Link
                href="/auth/register"
                className="btn bg-white text-brand-700 hover:bg-white/90 btn-lg font-semibold shadow-xl"
              >
                Jetzt kostenlos starten
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
