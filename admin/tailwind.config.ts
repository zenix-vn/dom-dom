import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#2A2118",
        inksoft: "#857862",
        gold: "#C8922B",
        goldbright: "#E7A12E",
        lacquer: "#B5392C",
        cream: "#FCF4E6",
      },
      fontFamily: {
        serif: ["Georgia", "Lora", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
