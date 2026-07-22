// src/components/Logo.jsx
// Usage: <UnicoreLogo size="md" />

import unicLogo from "../../assets/images.png";

const sizes = {
  sm: { text: "text-xl", img: "h-9" },   // ~36px — mobile drawer header
  md: { text: "text-2xl", img: "h-12" }, // ~48px — main navbar
  lg: { text: "text-4xl", img: "h-16" }, // ~64px — footer / hero / large placements
};

const UnicoreLogo = ({ size = "md", className = "" }) => {
  const s = sizes[size] || sizes.md;

  return (
    <span className={`flex items-center gap-2 select-none ${className}`}>
      <img
        src={unicLogo}
        alt="UNICORE"
        className={`${s.img} w-auto object-contain`}
      />
      <span className={`${s.text} font-bold tracking-tight`}>
        <span className="text-black dark:text-white">Uni </span>
        <span style={{ color: "#2C2DE0" }}>CORE</span>

      </span>
    </span>
  );
};

export default UnicoreLogo;