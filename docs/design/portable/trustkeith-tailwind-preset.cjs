module.exports = {
  theme: {
    extend: {
      colors: {
        tk: {
          brand: "#235875",
          "brand-hover": "#194359",
          accent: "#4285f4",
          "accent-strong": "#2459b3",
          text: "#222525",
          muted: "#4f5057",
          surface: "#ffffff",
          "surface-alt": "#fafafa",
          panel: "#fffaf4",
          border: "#ebebeb",
          success: "#068466",
          error: "#ea384c",
          cream: "#c3b6aa",
          "accent-soft": "#e0eeff"
        }
      },
      fontFamily: {
        "tk-display": ["Quincy CF", "Iowan Old Style", "Palatino Linotype", "serif"],
        "tk-heading": ["Merriweather", "Georgia", "serif"],
        "tk-body": ["Inter", "Helvetica Neue", "Arial", "sans-serif"]
      },
      borderRadius: {
        "tk-input": "4px",
        "tk-button": "6px",
        "tk-sm": "6px",
        "tk-md": "8px",
        "tk-lg": "16px",
        "tk-xl": "24px",
        "tk-pill": "999px"
      },
      spacing: {
        "tk-xs": "0.25rem",
        "tk-sm": "0.5rem",
        "tk-md": "1rem",
        "tk-lg": "1.5rem",
        "tk-xl": "2rem",
        "tk-2xl": "3rem"
      },
      boxShadow: {
        "tk-glass": "0 4px 16px rgba(0, 0, 0, 0.08)",
        "tk-card": "0 2px 16px rgba(0, 0, 0, 0.2), 0 16px 64px rgba(0, 0, 0, 0.5)"
      },
      transitionTimingFunction: {
        tk: "cubic-bezier(.25, .46, .45, .94)"
      }
    }
  }
};
