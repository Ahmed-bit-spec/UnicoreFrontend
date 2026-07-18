// src/components/Logo.jsx
// Usage: <UnicoreLogo size="md" />
// Pass isLight={true|false} to override dark-mode detection (used in the header).
// When isLight is not passed the component falls back to Tailwind dark: variants.

const sizes = {
  sm: { text: "text-lg",  dot: "w-1.5 h-1.5" },
  md: { text: "text-2xl", dot: "w-2 h-2" },
  lg: { text: "text-4xl", dot: "w-2.5 h-2.5" },
};

const UnicoreLogo = ({ size = "md", className = "", isLight }) => {
  const s = sizes[size] || sizes.md;

  // If isLight prop is explicitly provided, use it directly.
  // If not provided (undefined), fall back to Tailwind dark: class variants.
  const textClass =
    isLight !== undefined
      ? isLight
        ? "text-gray-900"   // light bg  → dark text
        : "text-white"      // dark bg   → white text
      : "text-gray-900 dark:text-white"; // auto via Tailwind

  return (
    <span
      className={`inline-flex items-baseline gap-0 font-black tracking-tight select-none ${s.text} ${className}`}
      aria-label="UNICORE"
    >
      <span className={textClass}>UNI</span>
      <span className="text-[#63DF4E] ml-1"  style={{
    textShadow: "0 2px 0 #3FAF2E"
  }}> CORE</span>
      
     
    </span>
  );
};

export default UnicoreLogo;