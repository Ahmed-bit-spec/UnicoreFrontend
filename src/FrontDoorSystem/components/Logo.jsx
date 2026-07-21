// src/components/Logo.jsx
// Usage: <UnicoreLogo size="md" />
// Place your logo file at: src/assets/unic.png (or public/unic.png — see note below)

import unicLogo from "../../assets/unic.png.jpeg";

const sizes = {
  sm: { height: "h-6" },   // ~24px
  md: { height: "h-8" },   // ~32px
  lg: { height: "h-12" },  // ~48px
};

const UnicoreLogo = ({ size = "md", className = "" }) => {
  const s = sizes[size] || sizes.md;

  return (
    <img
      src={unicLogo}
      alt="UNICORE"
      className={`${s.height} w-auto select-none ${className}`}
    />
  );
};

export default UnicoreLogo;