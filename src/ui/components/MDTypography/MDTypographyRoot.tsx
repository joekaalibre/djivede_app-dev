import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { Theme } from "@mui/material";

interface OwnerState {
  color?:
    | "inherit"
    | "primary"
    | "secondary"
    | "info"
    | "success"
    | "warning"
    | "error"
    | "light"
    | "dark"
    | "text"
    | "white";
  textTransform?: string;
  verticalAlign?: string;
  fontWeight?: false | "light" | "regular" | "medium" | "bold";
  opacity?: number;
  textGradient?: boolean;
  darkMode?: boolean;
}

export default styled(Typography)<{ ownerState: OwnerState }>(
  ({ theme, ownerState }: { theme: Theme; ownerState: OwnerState }) => {
    const { palette, typography, functions } = theme;
    const {
      color = "inherit",
      textTransform,
      verticalAlign,
      fontWeight,
      opacity = 1,
      textGradient = false,
      darkMode = false,
    } = ownerState;

    const { gradients, transparent, white } = palette;
    const { fontWeightLight, fontWeightRegular, fontWeightMedium, fontWeightBold } = typography;
    const { linearGradient } = functions;

    const fontWeights: Record<string, number> = {
      light: fontWeightLight,
      regular: fontWeightRegular,
      medium: fontWeightMedium,
      bold: fontWeightBold,
    };

    const gradientStyles = () => ({
      backgroundImage:
        color !== "inherit" && color !== "text" && color !== "white" && gradients[color]
          ? linearGradient(gradients[color].main, gradients[color].state)
          : linearGradient(gradients.dark.main, gradients.dark.state),
      display: "inline-block",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: transparent.main,
      position: "relative",
      zIndex: 1,
    });

    let colorValue =
      color === "inherit" || !palette[color as keyof typeof palette]
        ? "inherit"
        : palette[color as keyof typeof palette]?.main;

    if (darkMode && (color === "inherit" || !palette[color as keyof typeof palette])) {
      colorValue = "inherit";
    } else if (darkMode && color === "dark") {
      colorValue = white.main;
    }

    return {
      opacity,
      textTransform,
      verticalAlign,
      textDecoration: "none",
      color: colorValue,
      fontWeight: fontWeight && fontWeight !== false ? fontWeights[fontWeight] : undefined,
      ...(textGradient && gradientStyles()),
    };
  }
);
