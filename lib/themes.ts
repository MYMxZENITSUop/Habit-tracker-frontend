export type Theme = {
  id: string;
  name: string;
  bg: string;
  card: string;
  text: string;
  mutedText: string;
  primary: string;
  secondary: string;
  accent: string;
  gridEmpty: string;
  gridFilled: string;
};

export const THEMES: Theme[] = [
  /* =========================
     DARK (DEFAULT)
  ========================= */
  {
    id: "dark",
    name: "Dark (Default)",
    bg: "bg-gradient-to-br from-[#0b132b]/90 to-[#1c2541]/90",
    card: "bg-slate-900",
    text: "text-white",
    mutedText: "text-white/70",
    primary: "text-green-500",
    secondary: "bg-slate-800",
    accent: "bg-green-500",
    gridEmpty: "bg-slate-800",
    gridFilled: "bg-green-500",
  },

  /* =========================
     LIGHT
  ========================= */
  {
    id: "light",
    name: "Light (Default)",
    bg: "bg-slate-50",
    card: "bg-white",
    text: "text-slate-900",
    mutedText: "text-slate-500",
    primary: "text-green-600",
    secondary: "bg-slate-200",
    accent: "bg-green-600",
    gridEmpty: "bg-slate-200",
    gridFilled: "bg-green-600",
  },

  /* =========================
     MINIMALIST BENTO
  ========================= */
  {
    id: "minimal",
    name: "Minimalist Bento",
    bg: "bg-[#dfe6d1]",
    card: "bg-[#cfd9bf]",
    text: "text-[#2f3e1f]",
    mutedText: "text-[#5f6f4f]",
    primary: "text-[#3a5a40]",
    secondary: "bg-[#b7c8a0]",
    accent: "bg-[#3a5a40]",
    gridEmpty: "bg-[#b7c8a0]",
    gridFilled: "bg-[#3a5a40]",
  },

  /* =========================
     CIRCADIAN (DARK → WHITE TEXT)
  ========================= */
  {
    id: "circadian",
    name: "Circadian Mode",
    bg: "bg-[#160019]",
    card: "bg-[#240026]",
    text: "text-white",
    mutedText: "text-white/70",
    primary: "text-pink-400",
    secondary: "bg-[#300030]",
    accent: "bg-pink-500",
    gridEmpty: "bg-[#300030]",
    gridFilled: "bg-pink-500",
  },

  /* =========================
     LOFI & RETRO (DARK → WHITE TEXT)
  ========================= */
  {
    id: "lofi",
    name: "Lofi & Retro",
    bg: "bg-[#2b0f3a]",
    card: "bg-[#3b1457]",
    text: "text-white",
    mutedText: "text-white/70",
    primary: "text-pink-400",
    secondary: "bg-[#4b1a6b]",
    accent: "bg-pink-400",
    gridEmpty: "bg-[#4b1a6b]",
    gridFilled: "bg-pink-400",
  },

  /* =========================
     CLAY (MID → DARK CARD → WHITE TEXT)
  ========================= */
  {
    id: "clay",
    name: "Claymorphism",
    bg: "bg-[#e5e5e5]",
    card: "bg-[#f0f0f0]",
    text: "text-slate-900",
    mutedText: "text-slate-600",
    primary: "text-blue-500",
    secondary: "bg-[#dedede]",
    accent: "bg-blue-500",
    gridEmpty: "bg-[#dedede]",
    gridFilled: "bg-blue-500",
  },
];
