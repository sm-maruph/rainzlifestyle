/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        bubble: "bubble 6s linear infinite",
        abox1: "abox1 4s ease-in-out 1s infinite forwards",
        abox2: "abox2 4s ease-in-out 1s infinite forwards",
        abox3: "abox3 4s ease-in-out 1s infinite forwards",
        smoothBounce: "smoothBounce 1.2s ease-in-out infinite",
      },
      keyframes: {
        bubble: {
          "0%": { transform: "translateY(0)", opacity: "0.6" },
          "100%": { transform: "translateY(-100vh)", opacity: "0" },
        },
        abox1: {
          "0%": {
            width: "112px",
            height: "48px",
            marginTop: "64px",
            marginLeft: "0px",
          },
          "12.5%": {
            width: "48px",
            height: "48px",
            marginTop: "64px",
            marginLeft: "0px",
          },
          "25%": {
            width: "48px",
            height: "48px",
            marginTop: "64px",
            marginLeft: "0px",
          },
          "37.5%": {
            width: "48px",
            height: "48px",
            marginTop: "64px",
            marginLeft: "0px",
          },
          "50%": {
            width: "48px",
            height: "48px",
            marginTop: "64px",
            marginLeft: "0px",
          },
          "62.5%": {
            width: "48px",
            height: "48px",
            marginTop: "64px",
            marginLeft: "0px",
          },
          "75%": {
            width: "48px",
            height: "112px",
            marginTop: "0px",
            marginLeft: "0px",
          },
          "87.5%": {
            width: "48px",
            height: "48px",
            marginTop: "0px",
            marginLeft: "0px",
          },
          "100%": {
            width: "48px",
            height: "48px",
            marginTop: "0px",
            marginLeft: "0px",
          },
        },
        abox2: {
          "0%, 12.5%, 25%, 37.5%": {
            width: "48px",
            height: "48px",
            marginTop: "0px",
            marginLeft: "0px",
          },
          "50%": {
            width: "112px",
            height: "48px",
            marginTop: "0px",
            marginLeft: "0px",
          },
          "62.5%": {
            width: "48px",
            height: "48px",
            marginTop: "0px",
            marginLeft: "64px",
          },
          "75%, 87.5%, 100%": {
            width: "48px",
            height: "48px",
            marginTop: "0px",
            marginLeft: "64px",
          },
        },
        abox3: {
          "0%, 12.5%, 62.5%, 75%, 87.5%": {
            width: "48px",
            height: "48px",
            marginTop: "0px",
            marginLeft: "64px",
          },
          "25%": {
            width: "48px",
            height: "112px",
            marginTop: "0px",
            marginLeft: "64px",
          },
          "37.5%, 50%, 62.5%, 75%, 87.5%": {
            width: "48px",
            height: "48px",
            marginTop: "64px",
            marginLeft: "64px",
          },
          "100%": {
            width: "112px",
            height: "48px",
            marginTop: "64px",
            marginLeft: "0px",
          },
        },
        smoothBounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
      colors: {
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        tertiary: "var(--tertiary)",
        title: "var(--title)",
        subtitle: "var(--subtitle)",
        details: "var(--details)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        button: "var(--button)",
        "button-text": "var(--button-text)",
      },
      fontSize: {
        "xs-custom": "0.75rem", // Example custom font size
        "sm-custom": "0.875rem",
      },
    },
  },
  plugins: [],
};
