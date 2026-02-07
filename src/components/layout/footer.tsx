import { useTranslations } from "next-intl";
import { BookOpen, Heart } from "lucide-react";

export function Footer() {
  const t = useTranslations("common");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto py-8 px-4 border-t border-white/20">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-brand-500" />
          <span>{t("appName")} © {year}</span>
        </div>
        <div className="flex items-center gap-1">
          Made with <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" /> for
          teachers & students
        </div>
      </div>
    </footer>
  );
}
