/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b1020",
        surface: "#141a2e",
        surface2: "#1c2342",
        border: "#2a3358",
        muted: "#8a93b8",
        text: "#e6e9f5",
        accent: "#5b8cff",
        accent2: "#7c5cff",
        success: "#3ddc97",
        danger: "#ff5d73",
      },
      boxShadow: {
        card: "0 4px 24px -8px rgba(0,0,0,0.45)",
      },
    },
  },
  plugins: [],
};
