// 📁 src/ui/components/MDTypography/index.tsx
import React, { forwardRef } from "react";
import Typography, { TypographyProps } from "@mui/material/Typography";
import { styled, useTheme } from "@mui/material/styles";

export type MDTypographyProps = TypographyProps & {
  color?:
    | "inherit"
    | "primary"
    | "secondary"
    | "info"
    | "success"
    | "warning"
    | "error"
    | "text"
    | "white"
    | string;
  fontWeight?: false | number | "light" | "regular" | "medium" | "bold";
  textTransform?: "none" | "capitalize" | "uppercase" | "lowercase";
  verticalAlign?: "unset" | "baseline" | "sub" | "super" | "text-top" | "text-bottom" | "middle" | "top" | "bottom";
  textGradient?: boolean;
};

const MDTypographyRoot = styled(Typography, {
  shouldForwardProp: (prop) =>
    !["textTransform", "verticalAlign", "textGradient", "fontWeight", "color"].includes(prop as string),
})<MDTypographyProps>(({ theme, color = "text", fontWeight, textTransform, verticalAlign, textGradient }) => {
  const { palette, functions } = theme;
  const { linearGradient } = functions || {};

  const colorValue =
    color === "inherit"
      ? "inherit"
      : palette[color]?.main || color;

  const styles: any = {
    color: colorValue,
    fontWeight,
    textTransform,
    verticalAlign,
  };

  if (textGradient && palette[color] && linearGradient) {
    styles.backgroundImage = linearGradient(palette[color].main, palette[color].light);
    styles.display = "inline-block";
    styles.webkitBackgroundClip = "text";
    styles.webkitTextFillColor = "transparent";
  }

  return styles;
});

const MDTypography = forwardRef<HTMLSpanElement, MDTypographyProps>(({ children, ...rest }, ref) => (
  <MDTypographyRoot ref={ref} {...rest}>
    {children}
  </MDTypographyRoot>
));

export default MDTypography;
