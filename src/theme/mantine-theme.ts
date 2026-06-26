import { DEFAULT_THEME, createTheme, type MantineColorsTuple } from "@mantine/core";

const rhBlue: MantineColorsTuple = [
  "#e5f4ff",
  "#cfe6fb",
  "#9ac9f1",
  "#61abE8",
  "#3491e1",
  "#1b82dd",
  "#0d78dc",
  "#0067c4",
  "#0059b0",
  "#004b9b"
];

const rhGold: MantineColorsTuple = [
  "#fff8e5",
  "#feefcc",
  "#fddc99",
  "#fbc764",
  "#fab739",
  "#f9ac1d",
  "#f8a708",
  "#dd9100",
  "#c47f00",
  "#ab6c00"
];

const rhSlate: MantineColorsTuple = [
  "#eef3f7",
  "#dfe7ed",
  "#bccbd6",
  "#96adbE",
  "#7693a9",
  "#628398",
  "#55798f",
  "#48687d",
  "#3d5b70",
  "#2f485b"
];

export const mantineTheme = createTheme({
  primaryColor: "rhBlue",
  primaryShade: 7,
  colors: {
    rhBlue,
    rhGold,
    rhSlate
  },
  white: "#ffffff",
  black: "#0a2038",
  fontFamily: DEFAULT_THEME.fontFamily,
  fontFamilyMonospace: DEFAULT_THEME.fontFamilyMonospace,
  headings: {
    fontFamily: DEFAULT_THEME.fontFamily,
    fontWeight: "700",
    sizes: {
      h1: { fontSize: "clamp(2.5rem, 5vw, 4rem)", lineHeight: "1.05" },
      h2: { fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: "1.08" },
      h3: { fontSize: "clamp(1.5rem, 3vw, 2rem)", lineHeight: "1.15" }
    }
  },
  radius: {
    xs: "6px",
    sm: "8px",
    md: "10px",
    lg: "14px",
    xl: "18px"
  },
  spacing: {
    xs: "0.5rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem"
  },
  defaultRadius: "md",
  shadows: {
    xs: "0 1px 2px rgba(10, 32, 56, 0.04)",
    sm: "0 8px 24px rgba(10, 32, 56, 0.08)",
    md: "0 16px 36px rgba(10, 32, 56, 0.12)",
    lg: "0 22px 52px rgba(10, 32, 56, 0.16)",
    xl: "0 28px 60px rgba(10, 32, 56, 0.22)"
  },
  other: {
    shellMaxWidth: "1200px",
    surface: "#f4f6f9",
    shellBorder: "#d9e1e8",
    shellText: "#304255",
    deepNavy: "#0b4d74",
    darkNavy: "#08324d",
    gold: "#f5b61d",
    paleBlue: "#e8f2fa"
  }
});
