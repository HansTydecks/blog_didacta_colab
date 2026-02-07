"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  BookOpen,
  LogIn,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Globe,
} from "lucide-react";
import { localeNames, locales, type Locale } from "@/i18n/config";

export function Navbar() {
  const { data: session } = useSession();
  const t = useTranslations("common");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const switchLocale = (locale: Locale) => {
    document.cookie = `locale=${locale};path=/;max-age=${365 * 24 * 60 * 60}`;
    setLangOpen(false);
    window.location.reload();
  };

  return (
    <nav className="sticky top-0 z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl text-brand-700 hover:text-brand-800 transition-colors"
          >
            <BookOpen className="w-6 h-6" />
            <span>{t("appName")}</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/guide" className="btn-ghost btn-sm">
              {t("guide")}
            </Link>

            {/* Language switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="btn-ghost btn-sm"
              >
                <Globe className="w-4 h-4" />
                {t("language")}
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 glass-strong rounded-xl py-1 min-w-[140px] animate-slide-down">
                  {locales.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => switchLocale(loc)}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-white/60 transition-colors"
                    >
                      {localeNames[loc]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {session ? (
              <>
                <Link href="/dashboard" className="btn-ghost btn-sm">
                  <LayoutDashboard className="w-4 h-4" />
                  {t("dashboard")}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="btn-ghost btn-sm text-red-600 hover:text-red-700"
                >
                  <LogOut className="w-4 h-4" />
                  {t("logout")}
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="btn-ghost btn-sm">
                  <LogIn className="w-4 h-4" />
                  {t("login")}
                </Link>
                <Link href="/auth/register" className="btn-primary btn-sm">
                  {t("register")}
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden btn-ghost btn-sm"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-white/20 animate-slide-down space-y-1">
            <Link
              href="/guide"
              className="block px-3 py-2 rounded-xl hover:bg-white/50 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {t("guide")}
            </Link>
            <div className="px-3 py-2">
              <p className="text-xs text-gray-500 mb-1">{t("language")}</p>
              <div className="flex gap-2">
                {locales.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => switchLocale(loc)}
                    className="btn-ghost btn-sm text-xs"
                  >
                    {localeNames[loc]}
                  </button>
                ))}
              </div>
            </div>
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 rounded-xl hover:bg-white/50 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {t("dashboard")}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="block w-full text-left px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                >
                  {t("logout")}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block px-3 py-2 rounded-xl hover:bg-white/50 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {t("login")}
                </Link>
                <Link
                  href="/auth/register"
                  className="block px-3 py-2 rounded-xl bg-brand-600 text-white text-center"
                  onClick={() => setMobileOpen(false)}
                >
                  {t("register")}
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
