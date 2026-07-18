// LandingFooter.jsx
import { Link } from "react-router-dom";
import { Mail, MapPin, BookOpen, FileText, Bot, Users, LayoutDashboard, GraduationCap } from "lucide-react";
import UnicoreLogo from "./Logo";
import { useLanguage } from "@/hooks/useLanguage";

const LandingFooter = () => {
  const { t } = useLanguage() || {};

  const modules = [
    { icon: BookOpen, label: t?.modules?.library, to: "/library" },
    { icon: FileText, label: t?.modules?.exams, to: "/exams" },
    { icon: Bot, label: t?.modules?.aiAssistant, to: "/ai" },
    { icon: Users, label: t?.modules?.forum, to: "/forum" },
    { icon: LayoutDashboard, label: t?.modules?.dashboard, to: "/dashboard" },
    { icon: GraduationCap, label: t?.modules?.academic, to: "/records" },
  ];

  return (
    <footer className="w-full border-t border-white/10 dark:bg-black/90 bg-white" style={{ fontFamily: "'Geist Variable', 'Inter', sans-serif" }}>
      <div className="h-0.5 w-full bg-[#63DF4E]" />

      <div className="w-full max-w-350 mx-auto px-6 lg:px-10 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="lg:col-span-1">
          <UnicoreLogo size="md" />
          <p className="mt-4 text-sm dark:text-white/40 leading-relaxed max-w-xs">
            {t?.footer?.tagline}
          </p>
          <div className="flex flex-col gap-2 mt-5">
            <a href="mailto:info@elibrary.com"
              className="flex items-center gap-2 text-sm dark:dark:text-white/40 hover:text-[#63DF4E] transition-colors">
              <Mail size={13} />info@elibrary.com
            </a>
            <span className="flex items-center gap-2 text-sm dark:text-white/40">
              <MapPin size={13} />
              {t?.common?.university}, Mogadishu
            </span>
          </div>
        </div>

        {/* Quick links */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#63DF4E] mb-4">
            {t?.footer?.quickLinks}
          </p>
          <ul className="flex flex-col gap-2.5">
            {[
              { label: t?.navbar?.home, to: "/" },
              { label: t?.navbar?.about, to: "/about" },
              { label: t?.navbar?.contact, to: "/contact" },
              { label: t?.navbar?.signIn, to: "/login" },
              { label: t?.navbar?.signUp, to: "/signup" },
            ].map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-sm dark:text-white/40 hover:text-[#63DF4E] transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Modules */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#63DF4E] mb-4">
            {t?.navbar?.modules}
          </p>
          <ul className="flex flex-col gap-2.5">
            {modules.map((m) => {
              const Icon = m.icon;
              return (
                <li key={m.to}>
                  <Link to={m.to} className="flex items-center gap-2 text-sm dark:text-white/40 hover:text-[#63DF4E] transition-colors">
                    <Icon size={12} className="shrink-0" />
                    {m.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* CTA card */}
        <div className=" bg-[#58CC02]
              text-white
              text-sm
              font-bold
              shadow-[0_4px_0_#46A302]
              hover:translate-y-0.5
              hover:shadow-[0_2px_0_#46A302]
              active:translate-y-1
              active:shadow-none
              transition-all
              duration-150 rounded-2xl p-5 flex flex-col justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-black/50 mb-2">
              {t?.landing?.footer?.ctaEyebrow}            </p>
            <p className="text-sm font-black text-black leading-snug">
              {t?.landing?.footer?.ctaTitle}            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Link to="/signup"
              className="w-full py-2.5 rounded-xl bg-black text-white text-sm font-bold text-center hover:opacity-80 transition-opacity">
              {t?.navbar?.signUp}
            </Link>
            <Link to="/login"
              className="w-full py-2.5 rounded-xl border border-black/20 text-sm font-semibold text-black text-center hover:bg-black/10 transition-colors">
              {t?.navbar?.signIn}
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="w-full border-t border-black/5 dark:border-white/5">
        <div className="w-full max-w-350 mx-auto px-6 lg:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs dark:text-white/30 text-black/50">
            © 2026 UNICORE — {t?.common?.university}. {t?.footer?.allRightsReserved}
          </p>
          <span className="flex items-center gap-1.5 text-xs text-[#63DF4E] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#63DF4E] animate-pulse" />
            {t?.footer?.liveSystem}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;