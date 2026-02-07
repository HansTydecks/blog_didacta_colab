"use client";

import { useTranslations } from "next-intl";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  Lightbulb,
  Pencil,
  Type,
  AlignLeft,
  BookOpen,
  CheckCircle,
  Sparkles,
} from "lucide-react";

const stepIcons = [Lightbulb, Type, Pencil, AlignLeft, BookOpen, CheckCircle];

export default function GuidePage() {
  const t = useTranslations("guide");
  const stepKeys = ["s1", "s2", "s3", "s4", "s5", "s6"];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="blob-1" />
      <div className="blob-2" />
      <div className="blob-3" />
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-in">
          <div className="inline-flex items-center gap-2 badge-brand mb-4">
            <Sparkles className="w-4 h-4" />
            Guide
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">
            <span className="text-gradient">{t("title")}</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("intro")}
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {stepKeys.map((key, i) => {
            const Icon = stepIcons[i];
            return (
              <div
                key={key}
                className="glass rounded-2xl p-6 sm:p-8 hover:bg-white/70 transition-all duration-300 flex gap-5 items-start"
              >
                <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-1">
                    {t(`steps.${key}Title`)}
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    {t(`steps.${key}Desc`)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
