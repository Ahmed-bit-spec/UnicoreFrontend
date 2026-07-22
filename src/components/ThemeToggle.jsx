import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-10 w-10",
};

const ThemeToggle = ({ className = "", size = "md", showLabel = false }) => {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const label = isDark ? t.settings.switchLightMode : t.settings.switchDarkMode;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group`}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
      {showLabel && <span>{isDark ? t.settings.lightMode : t.settings.darkMode}</span>}
    </button>
  );
};

export default ThemeToggle;
