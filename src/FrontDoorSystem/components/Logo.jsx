// src/components/Logo.jsx
// Usage: <UnicoreLogo size="md" />

import unicLogo from "../../assets/logo.jpeg";

const sizes = {
  sm: { height: "h-9" },   // ~36px — mobile drawer header
  md: { height: "h-12" },  // ~48px — main navbar
  lg: { height: "h-16" },  // ~64px — footer / hero / large placements
};

const UnicoreLogo = ({ size = "md", className = "" }) => {
  const s = sizes[size] || sizes.md;

  return (
    <img
      src={unicLogo}
      alt="UNICORE"
      className={`${s.height} w-auto object-contain select-none ${className}`}
    />
  );
};

export default UnicoreLogo;