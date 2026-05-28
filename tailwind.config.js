/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        void: "#05050a",
        ink: "#090a12",
        ember: "#ff6b35",
        aurora: "#35f3ff",
        pulse: "#a78bfa",
        vita: "#39ffb6"
      },
      boxShadow: {
        glow: "0 0 60px rgba(53, 243, 255, 0.18)",
        ember: "0 0 70px rgba(255, 107, 53, 0.18)"
      },
      backgroundImage: {
        "radial-aura": "radial-gradient(circle at 30% 10%, rgba(53,243,255,.26), transparent 26%), radial-gradient(circle at 70% 30%, rgba(255,107,53,.18), transparent 28%), radial-gradient(circle at 50% 80%, rgba(167,139,250,.2), transparent 34%)"
      }
    }
  },
  plugins: []
};
