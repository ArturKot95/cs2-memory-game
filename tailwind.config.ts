import type { Config } from "tailwindcss";

export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      colors: {
        "cs2-orange": "#FF6B35",
        "cs2-blue": "#1E3A8A",
        "cs2-dark": "#0F172A",
        "cs2-gray": "#64748B",
      },
      fontFamily: {
        cs2: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
