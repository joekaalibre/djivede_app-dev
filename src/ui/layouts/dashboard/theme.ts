// 📁 src/ui/layouts/dashboard/theme.ts
import { createTheme } from "@mui/material/styles";

const linearGradient = (color1: string, color2: string) => `linear-gradient(${color1}, ${color2})`;

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0D9488",
      light: "#5EEAD4",
      dark: "#0F766E",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#9333EA",
      light: "#C084FC",
      dark: "#6B21A8",
      contrastText: "#FFFFFF",
    },
    success: {
      main: "#22C55E",
      contrastText: "#FFFFFF",
    },
    warning: {
      main: "#F59E0B",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#EF4444",
      contrastText: "#FFFFFF",
    },
    info: {
      main: "#3B82F6",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F8FAFC",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#111827",
      secondary: "#6B7280",
    },
    divider: "#E5E7EB",
    grey: {
      100: "#F3F4F6",
      200: "#E5E7EB",
      300: "#D1D5DB",
      400: "#9CA3AF",
      500: "#6B7280",
      600: "#4B5563",
      700: "#374151",
      800: "#1F2937",
      900: "#111827",
    },
    gradients: {
      primary: { main: "#0D9488", state: "#5EEAD4" },
      secondary: { main: "#9333EA", state: "#C084FC" },
      info: { main: "#3B82F6", state: "#60A5FA" },
    },
  },

  typography: {
    fontFamily: "'Poppins', sans-serif",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 500 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
    subtitle1: { fontWeight: 400 },
    button: { textTransform: "none", fontWeight: 600 },
  },

  shape: {
    borderRadius: 12,
  },

  shadows: Array(25).fill("none"),

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },

  functions: {
    linearGradient,
  },
});

export default theme;
